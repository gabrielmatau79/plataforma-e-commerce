import { HttpService } from '@nestjs/axios';
import { Controller, Get } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import { lastValueFrom } from 'rxjs';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async health() {
    const productsUrl = this.configService.getOrThrow<string>(
      'PRODUCTS_SERVICE_URL',
    );
    const ordersUrl =
      this.configService.getOrThrow<string>('ORDERS_SERVICE_URL');

    const [products, orders] = await Promise.allSettled([
      lastValueFrom(this.httpService.get(`${productsUrl}/health`)),
      lastValueFrom(this.httpService.get(`${ordersUrl}/health`)),
    ]);

    return {
      service: 'api-gateway',
      status:
        products.status === 'fulfilled' && orders.status === 'fulfilled'
          ? 'ok'
          : 'degraded',
      dependencies: {
        products:
          products.status === 'fulfilled'
            ? products.value.data
            : { status: 'unreachable' },
        orders:
          orders.status === 'fulfilled'
            ? orders.value.data
            : { status: 'unreachable' },
      },
    };
  }
}
