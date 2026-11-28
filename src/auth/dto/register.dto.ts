import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterOwnerDto {
  @IsString()
  @MinLength(2, { message: 'Nama pemilik minimal 2 karakter' })
  @MaxLength(80, { message: 'Nama pemilik maksimal 80 karakter' })
  name!: string;

  @IsEmail({}, { message: 'Format email tidak valid' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(72, { message: 'Password maksimal 72 karakter' })
  password!: string;

  @IsString()
  @MinLength(2, { message: 'Nama toko minimal 2 karakter' })
  @MaxLength(80, { message: 'Nama toko maksimal 80 karakter' })
  shopName!: string;

  @IsString()
  @MinLength(8, { message: 'Nomor HP minimal 8 karakter' })
  @MaxLength(20, { message: 'Nomor HP maksimal 20 karakter' })
  phone!: string;

  @IsString()
  @MinLength(10, { message: 'Alamat minimal 10 karakter' })
  @MaxLength(300, { message: 'Alamat maksimal 300 karakter' })
  address!: string;

  @IsString()
  @MinLength(10, { message: 'Deskripsi minimal 10 karakter' })
  @MaxLength(500, { message: 'Deskripsi maksimal 500 karakter' })
  description!: string;

  @IsOptional()
  @Matches(/^\d{13}$/, { message: 'NIB harus 13 digit angka' })
  nib?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'URL foto usaha maksimal 500 karakter' })
  photoUrl?: string;
}
