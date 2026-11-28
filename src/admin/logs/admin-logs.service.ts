import { Injectable } from '@nestjs/common';
import { AdminAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  getPagination,
  parseDateEndWib,
  parseDateStartWib,
  startOfDayWib,
} from '../../common/utils/helpers';
import type { LogCategory } from './dto/log.dto';

const CATEGORY_ACTIONS: Record<LogCategory, AdminAction[]> = {
  'Verifikasi UMKM': [AdminAction.APPROVE_SHOP, AdminAction.REJECT_SHOP],
  'Status UMKM': [AdminAction.ACTIVATE_SHOP, AdminAction.DEACTIVATE_SHOP],
  Kategori: [
    AdminAction.CREATE_CATEGORY,
    AdminAction.UPDATE_CATEGORY,
    AdminAction.DELETE_CATEGORY,
  ],
  Pengguna: [AdminAction.ACTIVATE_USER, AdminAction.DEACTIVATE_USER],
  Autentikasi: [AdminAction.LOGIN],
};

@Injectable()
export class AdminLogsService {
  constructor(private prisma: PrismaService) {}

  async list(query: {
    action?: AdminAction;
    category?: LogCategory;
    from?: string;
    to?: string;
    q?: string;
    targetType?: string;
    targetId?: string;
    page?: number;
    limit?: number;
  }) {
    const { page, limit, skip, take } = getPagination(query.page, query.limit);
    const where = this.buildWhere(query);
    const todayStart = startOfDayWib();

    const [total, logs, allTotal, todayCount, todayAdmins] =
      await this.prisma.$transaction([
        this.prisma.adminLog.count({ where }),
        this.prisma.adminLog.findMany({
          where,
          skip,
          take,
          orderBy: { createdAt: 'desc' },
          include: { admin: { select: { id: true, name: true, email: true } } },
        }),
        this.prisma.adminLog.count(),
        this.prisma.adminLog.count({
          where: { createdAt: { gte: todayStart } },
        }),
        this.prisma.adminLog.groupBy({
          by: ['adminId'],
          where: { createdAt: { gte: todayStart } },
          orderBy: { adminId: 'asc' },
        }),
      ]);

    const names = await this.resolveTargetNames(logs);

    return {
      data: logs.map((log) => {
        const resolved = names.get(`${log.targetType}:${log.targetId}`);
        return {
          id: log.id,
          admin: log.admin,
          action: log.action,
          targetType: log.targetType,
          targetId: log.targetId,
          targetName: resolved?.name ?? null,
          targetMeta: resolved?.meta ?? null,
          reason: log.reason,
          createdAt: log.createdAt,
        };
      }),
      meta: { page, limit, total },
      summary: {
        total: allTotal,
        todayCount,
        todayAdmins: todayAdmins.length,
      },
    };
  }

  private buildWhere(query: {
    action?: AdminAction;
    category?: LogCategory;
    from?: string;
    to?: string;
    q?: string;
    targetType?: string;
    targetId?: string;
  }): Prisma.AdminLogWhereInput {
    const where: Prisma.AdminLogWhereInput = {};
    if (query.targetType) where.targetType = query.targetType;
    if (query.targetId) where.targetId = query.targetId;
    if (query.category) {
      where.action = { in: CATEGORY_ACTIONS[query.category] };
    } else if (query.action) {
      where.action = query.action;
    }

    const from = parseDateStartWib(query.from);
    const to = parseDateEndWib(query.to);
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }

    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [
        { admin: { name: { contains: q } } },
        { targetId: { contains: q } },
        { reason: { contains: q } },
      ];
    }
    return where;
  }

  private async resolveTargetNames(
    logs: {
      targetType: string;
      targetId: string;
    }[],
  ): Promise<Map<string, { name: string; meta?: string }>> {
    const idsByType = new Map<string, Set<string>>();
    for (const log of logs) {
      const set = idsByType.get(log.targetType) ?? new Set<string>();
      set.add(log.targetId);
      idsByType.set(log.targetType, set);
    }

    const map = new Map<string, { name: string; meta?: string }>();
    const tasks: Promise<void>[] = [];

    const shopIds = [...(idsByType.get('SHOP') ?? [])];
    if (shopIds.length) {
      tasks.push(
        this.prisma.shop
          .findMany({
            where: { id: { in: shopIds } },
            select: { id: true, name: true, slug: true },
          })
          .then((shops) => {
            for (const shop of shops) {
              map.set(`SHOP:${shop.id}`, {
                name: shop.name,
                meta: `UMKM • ${shop.slug}`,
              });
            }
          }),
      );
    }

    const userIds = [...(idsByType.get('USER') ?? [])];
    if (userIds.length) {
      tasks.push(
        this.prisma.user
          .findMany({
            where: { id: { in: userIds } },
            select: { id: true, name: true, email: true, role: true },
          })
          .then((users) => {
            for (const user of users) {
              map.set(`USER:${user.id}`, {
                name: user.name,
                meta: `${user.role} • ${user.email}`,
              });
            }
          }),
      );
    }

    const categoryIds = [...(idsByType.get('CATEGORY') ?? [])];
    if (categoryIds.length) {
      tasks.push(
        this.prisma.category
          .findMany({
            where: { id: { in: categoryIds } },
            select: { id: true, name: true, slug: true },
          })
          .then((categories) => {
            for (const category of categories) {
              map.set(`CATEGORY:${category.id}`, {
                name: category.name,
                meta: `Kategori • ${category.slug}`,
              });
            }
          }),
      );
    }

    await Promise.all(tasks);
    return map;
  }
}
