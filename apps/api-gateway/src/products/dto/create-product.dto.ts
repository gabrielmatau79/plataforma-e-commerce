import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsPositive,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({ example: 'Mechanical Keyboard' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: 'Compact wireless mechanical keyboard.' })
  @IsString()
  @MaxLength(500)
  description!: string;

  @ApiProperty({ example: 99.99 })
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  price!: number;

  @ApiProperty({ example: 25 })
  @IsNumber()
  @Min(0)
  stock!: number;
}
