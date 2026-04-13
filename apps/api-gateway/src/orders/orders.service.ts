import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { mapHttpError } from '../common/http-exception.util';
import { CreateOrderDto } from './dto/create-order.dto';

export interface OrderItemResponse {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderResponse {
  id: number;
  status: string;
  total: number;
  items: OrderItemResponse[];
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class OrdersService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<OrderResponse[]> {
    const ordersServiceUrl =
      this.configService.getOrThrow<string>('ORDERS_SERVICE_URL');

    try {
      const response = await lastValueFrom(
        this.httpService.get<OrderResponse[]>(`${ordersServiceUrl}/orders`),
      );

      return response.data;
    } catch (error) {
      mapHttpError(error, 'Unable to retrieve orders.');
    }
  }

  async create(createOrderDto: CreateOrderDto): Promise<OrderResponse> {
    const ordersServiceUrl =
      this.configService.getOrThrow<string>('ORDERS_SERVICE_URL');

    try {
      const response = await lastValueFrom(
        this.httpService.post<OrderResponse>(
          `${ordersServiceUrl}/orders`,
          createOrderDto,
        ),
      );

      return response.data;
    } catch (error) {
      mapHttpError(error, 'Unable to create order.');
    }
  }

  async findOne(id: number): Promise<OrderResponse> {
    const ordersServiceUrl =
      this.configService.getOrThrow<string>('ORDERS_SERVICE_URL');

    try {
      const response = await lastValueFrom(
        this.httpService.get<OrderResponse>(`${ordersServiceUrl}/orders/${id}`),
      );

      return response.data;
    } catch (error) {
      mapHttpError(error, `Unable to retrieve order ${id}.`);
    }
  }
}
