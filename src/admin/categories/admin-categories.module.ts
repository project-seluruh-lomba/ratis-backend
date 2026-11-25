import { Module } from '@nestjs/common';
import { AdminCategoriesController } from './admin-categories.controller';
import { AdminCategoriesService } from './admin-categories.service';
import { AdminLogService } from '../../common/services/admin-log.service';

@Module({
  controllers: [AdminCategoriesController],
  providers: [AdminCategoriesService, AdminLogService],
})
export class AdminCategoriesModule {}
