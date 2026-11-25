import { Injectable } from '@nestjs/common';
import { AdminAction } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminLogService {
  constructor(private prisma: PrismaService) {}

  async record(params: {
    adminId: string;
    action: AdminAction;
    targetType: string;
    targetId: string;
    reason?: string | null;
  }) {
    return this.prisma.adminLog.create({ data: params });
  }
}
