import { Module } from '@nestjs/common';
import { AdminShopsController } from './admin-shops.controller';
import { AdminShopsService } from './admin-shops.service';
import { AdminLogService } from '../../common/services/admin-log.service';

@Module({
  controllers: [AdminShopsController],
  providers: [AdminShopsService, AdminLogService],
})
export class AdminShopsModule {}
