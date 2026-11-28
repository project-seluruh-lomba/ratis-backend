import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminLogsService } from './admin-logs.service';
import { ListLogsQueryDto } from './dto/log.dto';

@ApiTags('Admin - Logs')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Controller('admin/logs')
export class AdminLogsController {
  constructor(private service: AdminLogsService) {}

  @Get()
  list(@Query() query: ListLogsQueryDto) {
    return this.service.list(query);
  }
}
