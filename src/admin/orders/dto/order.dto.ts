import { Type } from 'class-transformer';
import {
  IsEnum,
  IsIn,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class ListOrdersQueryDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  shopId?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'Tanggal awal tidak valid' })
  from?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'Tanggal akhir tidak valid' })
  to?: string;

  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsIn(['terbaru', 'terlama'])
  sort?: 'terbaru' | 'terlama' = 'terbaru';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 10;
}
