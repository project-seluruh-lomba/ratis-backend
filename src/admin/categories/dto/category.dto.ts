import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @MinLength(2, { message: 'Nama kategori minimal 2 karakter' })
  @MaxLength(40, { message: 'Nama kategori maksimal 40 karakter' })
  name!: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: 'Nama kategori minimal 2 karakter' })
  @MaxLength(40, { message: 'Nama kategori maksimal 40 karakter' })
  name?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
