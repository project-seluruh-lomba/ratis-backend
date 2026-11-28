import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class CreateOrderItemDto {
  @IsString()
  productId!: string;

  @Type(() => Number)
  @IsInt({ message: 'Jumlah harus bilangan bulat' })
  @Min(1, { message: 'Jumlah minimal 1' })
  @Max(99, { message: 'Jumlah maksimal 99' })
  quantity!: number;
}

export class CreateOrderDto {
  @IsString()
  shopSlug!: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Pesanan minimal berisi satu produk' })
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];
}
