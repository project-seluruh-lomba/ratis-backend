import { BadRequestException, Injectable } from '@nestjs/common';
import { OrderStatus, PayoutStatus } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import {
  parseDateEndWib,
  parseDateStartWib,
  startOfDayWib,
} from '../../common/utils/helpers';

const MAX_RANGE_DAYS = 92;

@Injectable()
export class AdminFinanceService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  async get(query: { from?: string; to?: string }) {
    const to = parseDateEndWib(query.to) ?? this.endOfTodayWib();
    const from = parseDateStartWib(query.from) ?? this.startOfDayWibDaysAgo(29);

    if (from.getTime() > to.getTime()) {
      throw new BadRequestException('Rentang tanggal tidak valid');
    }
    const dayCount = Math.ceil(
      (to.getTime() - from.getTime()) / (24 * 60 * 60 * 1000),
    );
    if (dayCount > MAX_RANGE_DAYS) {
      throw new BadRequestException(`Rentang maksimal ${MAX_RANGE_DAYS} hari`);
    }

    const [orders, payouts, allPayouts] = await Promise.all([
      this.prisma.order.findMany({
        where: { createdAt: { gte: from, lte: to } },
        select: { createdAt: true, status: true, total: true },
      }),
      this.prisma.payout.findMany({
        where: {
          processedAt: { gte: from, lte: to },
          status: { in: [PayoutStatus.berhasil, PayoutStatus.terkirim] },
        },
        select: {
          processedAt: true,
          status: true,
          netAmount: true,
          commission: true,
        },
      }),
      this.prisma.payout.findMany({
        orderBy: { submittedAt: 'desc' },
        include: { shop: { select: { name: true } } },
      }),
    ]);

    const daily = this.buildDaily(from, to, orders, payouts);

    const totals = {
      gross: daily.reduce((sum, day) => sum + day.gross, 0),
      orders: daily.reduce((sum, day) => sum + day.orders, 0),
      completedOrders: daily.reduce((sum, day) => sum + day.completedOrders, 0),
      disbursed: daily.reduce((sum, day) => sum + day.disbursed, 0),
      commission: daily.reduce((sum, day) => sum + day.commission, 0),
      averageDaily: daily.length
        ? Math.round(
            daily.reduce((sum, day) => sum + day.gross, 0) / daily.length,
          )
        : 0,
      commissionRate: 0,
    };
    totals.commissionRate = totals.gross ? totals.commission / totals.gross : 0;

    const readyPayouts = allPayouts.filter(
      (payout) =>
        payout.status === PayoutStatus.menunggu ||
        payout.status === PayoutStatus.diverifikasi,
    );
    const statusCounts = {
      menunggu: 0,
      diverifikasi: 0,
      berhasil: 0,
      terkirim: 0,
    } as Record<PayoutStatus, number>;
    for (const payout of allPayouts) statusCounts[payout.status] += 1;

    return {
      range: {
        from: this.wibDateKey(from),
        to: this.wibDateKey(to),
        days: daily.length,
      },
      daily,
      totals,
      payouts: {
        total: allPayouts.length,
        readyCount: readyPayouts.length,
        readyTotal: readyPayouts.reduce(
          (sum, payout) => sum + payout.netAmount,
          0,
        ),
        statusCounts,
      },
      escrow: {
        bank: this.config.get<string>('ESCROW_BANK_NAME') ?? null,
        accountNumber: this.config.get<string>('ESCROW_ACCOUNT_NUMBER') ?? null,
        outstanding: readyPayouts.reduce(
          (sum, payout) => sum + payout.netAmount,
          0,
        ),
      },
      activities: allPayouts.slice(0, 6).map((payout) => ({
        id: payout.id,
        title: this.payoutActivityTitle(payout.status),
        description: `${payout.id} • ${payout.shop.name} • Rp ${payout.netAmount.toLocaleString('id-ID')}`,
        at: (payout.processedAt ?? payout.submittedAt).toISOString(),
        tone:
          payout.status === PayoutStatus.berhasil ||
          payout.status === PayoutStatus.terkirim
            ? ('success' as const)
            : ('warning' as const),
        badge:
          payout.status === PayoutStatus.menunggu
            ? 'Perlu Tindakan'
            : undefined,
      })),
    };
  }

  private buildDaily(
    from: Date,
    to: Date,
    orders: { createdAt: Date; status: OrderStatus; total: number }[],
    payouts: {
      processedAt: Date | null;
      status: PayoutStatus;
      netAmount: number;
      commission: number;
    }[],
  ) {
    const buckets = new Map<
      string,
      {
        date: string;
        gross: number;
        orders: number;
        completedOrders: number;
        disbursed: number;
        commission: number;
      }
    >();

    const start = startOfDayWib(from);
    for (let cursor = start.getTime(); cursor <= to.getTime();) {
      const date = new Date(cursor);
      buckets.set(this.wibDateKey(date), {
        date: this.wibDateKey(date),
        gross: 0,
        orders: 0,
        completedOrders: 0,
        disbursed: 0,
        commission: 0,
      });
      cursor += 24 * 60 * 60 * 1000;
    }

    for (const order of orders) {
      const bucket = buckets.get(this.wibDateKey(order.createdAt));
      if (!bucket) continue;
      bucket.orders += 1;
      if (order.status === OrderStatus.selesai) {
        bucket.completedOrders += 1;
        bucket.gross += order.total;
      }
    }

    for (const payout of payouts) {
      if (!payout.processedAt) continue;
      const bucket = buckets.get(this.wibDateKey(payout.processedAt));
      if (!bucket) continue;
      bucket.disbursed += payout.netAmount;
      bucket.commission += payout.commission;
    }

    return Array.from(buckets.values());
  }

  private payoutActivityTitle(status: PayoutStatus) {
    if (status === PayoutStatus.menunggu) return 'Pengajuan Pencairan Masuk';
    if (status === PayoutStatus.diverifikasi) return 'Pengajuan Diverifikasi';
    if (status === PayoutStatus.berhasil) return 'Settlement Berhasil';
    return 'Dana Terkirim ke Merchant';
  }

  private startOfDayWibDaysAgo(daysAgo: number) {
    const start = startOfDayWib();
    return new Date(start.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  }

  private endOfTodayWib() {
    return new Date(startOfDayWib().getTime() + 24 * 60 * 60 * 1000 - 1);
  }

  private wibDateKey(date: Date) {
    const wib = new Date(date.getTime() + 7 * 60 * 60 * 1000);
    return wib.toISOString().slice(0, 10);
  }
}
