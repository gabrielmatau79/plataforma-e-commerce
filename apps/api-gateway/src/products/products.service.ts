import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom } from 'rxjs';
import { mapHttpError } from '../common/http-exception.util';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

@Injectable()
export class ProductsService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async findAll(): Promise<ProductResponse[]> {
    const productsServiceUrl = this.configService.getOrThrow<string>(
      'PRODUCTS_SERVICE_URL',
    );

    try {
      const response = await lastValueFrom(
        this.httpService.get<ProductResponse[]>(
          `${productsServiceUrl}/products`,
        ),
      );

      return response.data;
    } catch (error) {
      mapHttpError(error, 'Unable to retrieve products.');
    }
  }

  async create(createProductDto: CreateProductDto): Promise<ProductResponse> {
    const productsServiceUrl = this.configService.getOrThrow<string>(
      'PRODUCTS_SERVICE_URL',
    );

    try {
      const response = await lastValueFrom(
        this.httpService.post<ProductResponse>(
          `${productsServiceUrl}/products`,
          createProductDto,
        ),
      );

      return response.data;
    } catch (error) {
      mapHttpError(error, 'Unable to create product.');
    }
  }

  async findOne(id: number): Promise<ProductResponse> {
    const productsServiceUrl = this.configService.getOrThrow<string>(
      'PRODUCTS_SERVICE_URL',
    );

    try {
      const response = await lastValueFrom(
        this.httpService.get<ProductResponse>(
          `${productsServiceUrl}/products/${id}`,
        ),
      );

      return response.data;
    } catch (error) {
      mapHttpError(error, `Unable to retrieve product ${id}.`);
    }
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponse> {
    const productsServiceUrl = this.configService.getOrThrow<string>(
      'PRODUCTS_SERVICE_URL',
    );

    try {
      const response = await lastValueFrom(
        this.httpService.patch<ProductResponse>(
          `${productsServiceUrl}/products/${id}`,
          updateProductDto,
        ),
      );

      return response.data;
    } catch (error) {
      mapHttpError(error, `Unable to update product ${id}.`);
    }
  }
}
