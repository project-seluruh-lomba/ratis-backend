import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ShopStatus } from '@prisma/client';

export class ListShopsQueryDto {
  @IsOptional()
  @IsEnum(ShopStatus)
  status?: ShopStatus;

  @IsOptional()
  @IsString()
  q?: string;

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

export class RejectShopDto {
  @IsString()
  @MinLength(10, { message: 'Alasan minimal 10 karakter' })
  @MaxLength(300, { message: 'Alasan maksimal 300 karakter' })
  reason!: string;
}

export class UpdateShopStatusDto {
  @IsEnum(ShopStatus, { message: 'Status tidak valid' })
  status!: ShopStatus;

  @IsOptional()
  @IsString()
  @MinLength(10, { message: 'Alasan minimal 10 karakter' })
  @MaxLength(300, { message: 'Alasan maksimal 300 karakter' })
  reason?: string;
}
