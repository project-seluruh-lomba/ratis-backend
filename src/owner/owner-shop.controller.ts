import { Controller, Get, Post, Body, HttpCode, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import type { AuthUser } from '../common/decorators/current-user.decorator';
import { OwnerShopService } from './owner-shop.service';
import { ResubmitShopDto } from './dto/resubmit-shop.dto';

@ApiTags('Owner - Shop')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.OWNER)
@Controller('owner')
export class OwnerShopController {
  constructor(private service: OwnerShopService) {}

  @Get('shop')
  getOwnShop(@CurrentUser() user: AuthUser) {
    return this.service.getOwnShop(user.id);
  }

  @Post('shop/resubmit')
  @HttpCode(200)
  resubmit(@CurrentUser() user: AuthUser, @Body() dto: ResubmitShopDto) {
    return this.service.resubmit(user.id, dto);
  }
}
