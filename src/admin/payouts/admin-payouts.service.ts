import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminAction, PayoutStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

const ACTIONABLE_STATUSES: PayoutStatus[] = [
  PayoutStatus.menunggu,
  PayoutStatus.diverifikasi,
];

@Injectable()
export class AdminPayoutsService {
  constructor(private prisma: PrismaService) {}

  async list() {
    const payouts = await this.prisma.payout.findMany({
      orderBy: { submittedAt: 'desc' },
      include: {
        shop: {
          select: {
            name: true,
            owner: { select: { name: true } },
          },
        },
      },
    });

    return payouts.map((payout) => ({
      id: payout.id,
      storeName: payout.shop.name,
      owner: payout.shop.owner.name,
      bank: payout.bank,
      account: payout.account,
      method: payout.method,
      netAmount: payout.netAmount,
      commission: payout.commission,
      submittedAt: payout.submittedAt,
      status: payout.status,
    }));
  }

  async processBatch(ids: string[], adminId: string) {
    const uniqueIds = [...new Set(ids)];
    const payouts = await this.prisma.payout.findMany({
      where: { id: { in: uniqueIds } },
    });

    if (payouts.length !== uniqueIds.length) {
      const foundIds = new Set(payouts.map((payout) => payout.id));
      const missingIds = uniqueIds.filter((id) => !foundIds.has(id));
      throw new NotFoundException(
        `Pengajuan pencairan tidak ditemukan: ${missingIds.join(', ')}`,
      );
    }

    const actionable = payouts.filter((payout) =>
      ACTIONABLE_STATUSES.includes(payout.status),
    );
    if (actionable.length === 0) {
      throw new BadRequestException(
        'Tidak ada pengajuan yang dapat diproses pada batch ini',
      );
    }

    const actionableIds = actionable.map((payout) => payout.id);
    const skippedIds = payouts
      .filter((payout) => !actionableIds.includes(payout.id))
      .map((payout) => payout.id);
    const totalNet = actionable.reduce(
      (total, payout) => total + payout.netAmount,
      0,
    );
    const totalCommission = actionable.reduce(
      (total, payout) => total + payout.commission,
      0,
    );
    const processedAt = new Date();

    await this.prisma.$transaction(async (tx) => {
      await tx.payout.updateMany({
        where: { id: { in: actionableIds } },
        data: {
          status: PayoutStatus.berhasil,
          processedAt,
          processedById: adminId,
        },
      });

      await tx.adminLog.createMany({
        data: actionableIds.map((id) => ({
          adminId,
          action: AdminAction.PROCESS_PAYOUT_BATCH,
          targetType: 'PAYOUT',
          targetId: id,
          reason: `Batch pencairan diproses bersama ${actionableIds.length} pengajuan`,
        })),
      });
    });

    return {
      processedCount: actionableIds.length,
      processedIds: actionableIds,
      skippedIds,
      totalNet,
      totalCommission,
      processedAt,
    };
  }
}
