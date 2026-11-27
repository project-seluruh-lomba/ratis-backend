import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { AdminPayoutsService } from './admin-payouts.service';
import { ProcessPayoutBatchDto } from './dto/payout.dto';

@ApiTags('Admin - Payouts')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/payouts')
export class AdminPayoutsController {
  constructor(private service: AdminPayoutsService) {}

  @Get()
  list() {
    return this.service.list();
  }

  @Post('batch-process')
  @HttpCode(200)
  processBatch(
    @Body() dto: ProcessPayoutBatchDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.service.processBatch(dto.ids, user.id);
  }
}
