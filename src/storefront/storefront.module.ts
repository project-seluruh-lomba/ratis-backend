import { Module } from '@nestjs/common';
import { StorefrontController } from './storefront.controller';
import { StorefrontOrdersController } from './storefront-orders.controller';
import { StorefrontService } from './storefront.service';

@Module({
  controllers: [StorefrontController, StorefrontOrdersController],
  providers: [StorefrontService],
})
export class StorefrontModule {}
