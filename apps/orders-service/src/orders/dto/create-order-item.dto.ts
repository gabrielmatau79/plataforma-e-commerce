import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateOrderItemDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  productId!: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  quantity!: number;
}
