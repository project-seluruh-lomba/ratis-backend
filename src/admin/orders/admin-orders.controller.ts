import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminOrdersService } from './admin-orders.service';
import { ListOrdersQueryDto } from './dto/order.dto';

@ApiTags('Admin - Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/orders')
export class AdminOrdersController {
  constructor(private service: AdminOrdersService) {}

  @Get()
  list(@Query() query: ListOrdersQueryDto) {
    return this.service.list(query);
  }

  @Get(':id')
  detail(@Param('id') id: string) {
    return this.service.detail(id);
  }
}
