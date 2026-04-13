import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: '4K Monitor' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: '27-inch monitor for productivity.' })
  @IsString()
  @MaxLength(500)
  description!: string;

  @ApiProperty({ example: 399.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @ApiProperty({ example: 15 })
  @IsNumber()
  @Min(0)
  stock!: number;
}
