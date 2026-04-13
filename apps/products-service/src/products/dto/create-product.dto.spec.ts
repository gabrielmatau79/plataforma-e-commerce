import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateProductDto } from './create-product.dto';

describe('CreateProductDto', () => {
  it('accepts a valid payload', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 'Mechanical Keyboard',
      description: 'Compact keyboard with RGB backlight.',
      price: 89.99,
      stock: 15,
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects invalid price and stock', async () => {
    const dto = plainToInstance(CreateProductDto, {
      name: 'Mechanical Keyboard',
      description: 'Compact keyboard with RGB backlight.',
      price: -10,
      stock: -1,
    });

    const errors = await validate(dto);
    const properties = errors.map((error) => error.property);

    expect(properties).toContain('price');
    expect(properties).toContain('stock');
  });
});
