import { Injectable } from '@nestjs/common';
import { OrderStatus, ShopStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AdminDashboardService {
  constructor(private prisma: PrismaService) {}

  async get(rangeDays: 7 | 30 = 7) {
    const range = rangeDays === 30 ? 30 : 7;
    const since = this.startOfDayWibDaysAgo(range - 1);
    const [
      pending,
      aktif,
      ditolak,
      nonaktif,
      totalOrders,
      completedOrders,
      omzetAgg,
      pendingLatest,
      topShops,
      orders,
    ] = await Promise.all([
      this.prisma.shop.count({ where: { status: ShopStatus.pending } }),
      this.prisma.shop.count({ where: { status: ShopStatus.aktif } }),
      this.prisma.shop.count({ where: { status: ShopStatus.ditolak } }),
      this.prisma.shop.count({ where: { status: ShopStatus.nonaktif } }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: OrderStatus.selesai } }),
      this.prisma.order.aggregate({
        where: { status: OrderStatus.selesai },
        _sum: { total: true },
      }),
      this.prisma.shop.findMany({
        where: { status: ShopStatus.pending },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { owner: { select: { name: true } } },
      }),
      this.prisma.order.groupBy({
        by: ['shopId'],
        where: { status: OrderStatus.selesai, createdAt: { gte: since } },
        _sum: { total: true },
        _count: { _all: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 5,
      }),
      this.prisma.order.findMany({
        where: { createdAt: { gte: since } },
        select: { createdAt: true, status: true, total: true },
      }),
    ]);

    const shopIds = topShops.map((s) => s.shopId);
    const shops = shopIds.length
      ? await this.prisma.shop.findMany({
          where: { id: { in: shopIds } },
          select: {
            id: true,
            name: true,
            slug: true,
            owner: { select: { name: true } },
          },
        })
      : [];
    const shopMap = new Map(shops.map((s) => [s.id, s]));
    const trend = this.buildTrend(range, since, orders);

    return {
      shops: {
        pending,
        aktif,
        ditolak,
        nonaktif,
        total: pending + aktif + ditolak + nonaktif,
      },
      totalOrders,
      completedOrders,
      omzet: omzetAgg._sum.total ?? 0,
      trend,
      pendingUmkm: pendingLatest.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        ownerName: s.owner.name,
        createdAt: s.createdAt,
      })),
      topShops: topShops.map((t) => ({
        shopId: t.shopId,
        name: shopMap.get(t.shopId)?.name ?? '-',
        slug: shopMap.get(t.shopId)?.slug ?? '-',
        ownerName: shopMap.get(t.shopId)?.owner.name ?? '-',
        omzet: t._sum.total ?? 0,
        completedOrders: t._count._all,
      })),
    };
  }

  private startOfDayWibDaysAgo(daysAgo: number) {
    const now = new Date();
    const wibMs = now.getTime() + 7 * 60 * 60 * 1000;
    const wib = new Date(wibMs);
    wib.setUTCHours(0, 0, 0, 0);
    wib.setUTCDate(wib.getUTCDate() - daysAgo);
    return new Date(wib.getTime() - 7 * 60 * 60 * 1000);
  }

  private buildTrend(
    range: number,
    since: Date,
    orders: { createdAt: Date; status: OrderStatus; total: number }[],
  ) {
    const buckets = new Map<
      string,
      { date: string; orders: number; omzet: number }
    >();
    for (let i = 0; i < range; i++) {
      const d = new Date(since.getTime() + i * 24 * 60 * 60 * 1000);
      const key = this.wibDateKey(d);
      buckets.set(key, { date: key, orders: 0, omzet: 0 });
    }
    for (const o of orders) {
      const key = this.wibDateKey(o.createdAt);
      const b = buckets.get(key);
      if (!b) continue;
      b.orders += 1;
      if (o.status === OrderStatus.selesai) b.omzet += o.total;
    }
    return Array.from(buckets.values());
  }

  private wibDateKey(date: Date) {
    const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return wib.toISOString().slice(0, 10);
  }
}
