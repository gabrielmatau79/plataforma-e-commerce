import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';

@Injectable()
export class ProductsService implements OnModuleInit {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async onModuleInit() {
    const productsCount = await this.productRepository.count();

    if (productsCount > 0) {
      return;
    }

    await this.productRepository.save([
      {
        name: 'Wireless Mouse',
        description: 'Ergonomic wireless mouse with USB receiver.',
        price: 29.9,
        stock: 100,
      },
      {
        name: 'Mechanical Keyboard',
        description: 'Compact mechanical keyboard with backlight.',
        price: 89.5,
        stock: 40,
      },
      {
        name: 'USB-C Dock',
        description: 'Docking station with HDMI, USB and Ethernet ports.',
        price: 119,
        stock: 20,
      },
    ]);
  }

  findAll() {
    return this.productRepository.find({
      order: {
        id: 'ASC',
      },
    });
  }

  async findOne(id: number) {
    const product = await this.productRepository.findOneBy({ id });

    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found.`);
    }

    return product;
  }

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
    return this.productRepository.save(product);
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const product = await this.findOne(id);

    const updatedProduct = this.productRepository.merge(
      product,
      updateProductDto,
    );
    return this.productRepository.save(updatedProduct);
  }
}
