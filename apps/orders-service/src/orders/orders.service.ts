import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';

interface ProductSnapshot {
  id: number;
  name: string;
  price: number;
  stock: number;
}

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  findAll() {
    return this.orderRepository.find({
      order: {
        id: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
    });

    if (!order) {
      throw new NotFoundException(`Order with id ${id} not found.`);
    }

    return order;
  }

  async create(createOrderDto: CreateOrderDto) {
    const itemsData = await Promise.all(
      createOrderDto.items.map(async (item) => {
        const product = await this.fetchProduct(item.productId);

        if (product.stock < item.quantity) {
          throw new BadRequestException(
            `Insufficient stock for product ${item.productId}.`,
          );
        }

        const subtotal = Number((product.price * item.quantity).toFixed(2));

        return {
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: product.price,
          subtotal,
        } satisfies Partial<OrderItem>;
      }),
    );

    const total = Number(
      itemsData
        .reduce((sum, item) => sum + Number(item.subtotal ?? 0), 0)
        .toFixed(2),
    );

    return this.orderRepository.manager.transaction(async (entityManager) => {
      const order = entityManager.create(Order, {
        status: 'CREATED',
        total,
      });

      const savedOrder = await entityManager.save(Order, order);

      const orderItems = itemsData.map((item) =>
        entityManager.create(OrderItem, {
          ...item,
          orderId: savedOrder.id,
        }),
      );

      await entityManager.save(OrderItem, orderItems);

      return entityManager.findOneOrFail(Order, {
        where: { id: savedOrder.id },
      });
    });
  }

  private async fetchProduct(productId: number): Promise<ProductSnapshot> {
    const productsServiceUrl = this.configService.getOrThrow<string>(
      'PRODUCTS_SERVICE_URL',
    );

    try {
      const response = await lastValueFrom(
        this.httpService.get<ProductSnapshot>(
          `${productsServiceUrl}/products/${productId}`,
        ),
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        throw new BadRequestException(
          `Product with id ${productId} not found.`,
        );
      }

      throw new BadGatewayException(
        'Unable to validate products for the order.',
      );
    }
  }
}
