import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminFinanceService } from './admin-finance.service';
import { FinanceQueryDto } from './dto/finance.dto';

@ApiTags('Admin - Finance')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/finance')
export class AdminFinanceController {
  constructor(private service: AdminFinanceService) {}

  @Get()
  get(@Query() query: FinanceQueryDto) {
    return this.service.get(query);
  }
}
