import { IsISO8601, IsOptional } from 'class-validator';

export class FinanceQueryDto {
  @IsOptional()
  @IsISO8601({}, { message: 'Tanggal awal tidak valid' })
  from?: string;

  @IsOptional()
  @IsISO8601({}, { message: 'Tanggal akhir tidak valid' })
  to?: string;
}
