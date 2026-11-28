import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { StorefrontService } from './storefront.service';
import { ListPublicShopsQueryDto } from './dto/list-shops.dto';

@ApiTags('Public - Storefront')
@Public()
@Controller('public')
export class StorefrontController {
  constructor(private service: StorefrontService) {}

  @Get('shops')
  listShops(@Query() query: ListPublicShopsQueryDto) {
    return this.service.listShops(query);
  }

  @Get('shops/:slug')
  getShop(@Param('slug') slug: string) {
    return this.service.getShopBySlug(slug);
  }

  @Get('categories')
  listCategories() {
    return this.service.listCategories();
  }
}
