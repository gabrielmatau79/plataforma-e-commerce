import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { Order } from './orders/order.entity';
import { OrderItem } from './orders/order-item.entity';
import { OrdersModule } from './orders/orders.module';
import { ProductReference } from './products/product-reference.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HttpModule,
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.getOrThrow<string>('DATABASE_URL'),
        entities: [Order, OrderItem, ProductReference],
        synchronize: true,
      }),
    }),
    OrdersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
