import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { AdminShopsService } from './admin-shops.service';
import {
  ListShopsQueryDto,
  RejectShopDto,
  UpdateShopStatusDto,
} from './dto/shop.dto';

@ApiTags('Admin - Shops')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/shops')
export class AdminShopsController {
  constructor(private service: AdminShopsService) {}

  @Get()
  list(@Query() query: ListShopsQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.service.detail(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string, @CurrentUser() user: AuthUser) {
    return this.service.approve(id, user.id);
  }

  @Patch(':id/reject')
  reject(
    @Param('id') id: string,
    @Body() dto: RejectShopDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.reject(id, user.id, dto.reason);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateShopStatusDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.updateStatus(id, user.id, dto.status, dto.reason);
  }
}
