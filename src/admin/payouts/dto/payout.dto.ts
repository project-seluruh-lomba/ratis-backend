import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsString,
} from 'class-validator';

export class ProcessPayoutBatchDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'Pilih minimal satu pengajuan pencairan' })
  @ArrayMaxSize(100, { message: 'Maksimal 100 pengajuan per batch' })
  @IsString({ each: true })
  ids!: string[];
}
