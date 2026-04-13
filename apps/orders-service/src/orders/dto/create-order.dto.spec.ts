import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateOrderDto } from './create-order.dto';

describe('CreateOrderDto', () => {
  it('accepts a valid payload', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      items: [
        { productId: 1, quantity: 2 },
        { productId: 2, quantity: 1 },
      ],
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(0);
  });

  it('rejects an empty items array', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      items: [],
    });

    const errors = await validate(dto);

    expect(errors).toHaveLength(1);
    expect(errors[0]?.property).toBe('items');
  });

  it('rejects invalid nested items', async () => {
    const dto = plainToInstance(CreateOrderDto, {
      items: [{ productId: 0, quantity: 0 }],
    });

    const errors = await validate(dto);
    const itemErrors = errors[0]?.children ?? [];
    const nestedConstraints = itemErrors[0]?.children?.map(
      (error) => error.property,
    );

    expect(errors[0]?.property).toBe('items');
    expect(nestedConstraints).toContain('productId');
    expect(nestedConstraints).toContain('quantity');
  });
});
