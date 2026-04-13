import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductReference } from '../products/product-reference.entity';
import { Order } from './order.entity';
import { OrderItem } from './order-item.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [
    HttpModule,
    TypeOrmModule.forFeature([Order, OrderItem, ProductReference]),
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
})
export class OrdersModule {}
