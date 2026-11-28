import { Module } from '@nestjs/common';
import { AdminUsersController } from './admin-users.controller';
import { AdminUsersService } from './admin-users.service';
import { AdminLogService } from '../../common/services/admin-log.service';

@Module({
  controllers: [AdminUsersController],
  providers: [AdminUsersService, AdminLogService],
})
export class AdminUsersModule {}
