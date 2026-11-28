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
import { AdminAction } from '@prisma/client';

export const LOG_CATEGORIES = [
  'Verifikasi UMKM',
  'Status UMKM',
  'Kategori',
  'Pengguna',
  'Autentikasi',
] as const;

export type LogCategory = (typeof LOG_CATEGORIES)[number];

export class ListLogsQueryDto {
  @IsOptional()
  @IsEnum(AdminAction)
  action?: AdminAction;

  @IsOptional()
  @IsIn(LOG_CATEGORIES)
  category?: LogCategory;

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
  @IsString()
  targetType?: string;

  @IsOptional()
  @IsString()
  targetId?: string;

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
