import { Module } from '@nestjs/common';
import { OwnerShopController } from './owner-shop.controller';
import { OwnerShopService } from './owner-shop.service';

@Module({
  controllers: [OwnerShopController],
  providers: [OwnerShopService],
})
export class OwnerModule {}
