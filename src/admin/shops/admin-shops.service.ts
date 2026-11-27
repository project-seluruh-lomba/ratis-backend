import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminAction, Prisma, ShopStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { getPagination } from '../../common/utils/helpers';
import { AdminLogService } from '../../common/services/admin-log.service';

@Injectable()
export class AdminShopsService {
  constructor(
    private prisma: PrismaService,
    private adminLog: AdminLogService,
  ) {}

  async list(query: {
    status?: ShopStatus;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const { page, limit, skip, take } = getPagination(query.page, query.limit);
    const where: Prisma.ShopWhereInput = {};
    if (query.status) where.status = query.status;
    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [
        { name: { contains: q } },
        { owner: { name: { contains: q } } },
      ];
    }
    const [total, shops] = await this.prisma.$transaction([
      this.prisma.shop.count({ where }),
      this.prisma.shop.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: { owner: { select: { id: true, name: true, email: true } } },
      }),
    ]);
    return {
      data: shops.map((s) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        description: s.description,
        phone: s.phone,
        address: s.address,
        nib: s.nib,
        photoUrl: s.photoUrl,
        status: s.status,
        statusReason: s.statusReason,
        verifiedAt: s.verifiedAt,
        createdAt: s.createdAt,
        owner: s.owner,
      })),
      meta: { page, limit, total },
    };
  }

  async detail(id: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, name: true, email: true, isActive: true },
        },
        statusHistories: {
          orderBy: { createdAt: 'desc' },
          include: { changedBy: { select: { id: true, name: true } } },
        },
        _count: { select: { products: true, orders: true } },
      },
    });
    if (!shop) throw new NotFoundException('UMKM tidak ditemukan');
    return {
      data: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        description: shop.description,
        phone: shop.phone,
        address: shop.address,
        nib: shop.nib,
        photoUrl: shop.photoUrl,
        status: shop.status,
        statusReason: shop.statusReason,
        verifiedAt: shop.verifiedAt,
        createdAt: shop.createdAt,
        owner: shop.owner,
        summary: {
          productCount: shop._count.products,
          orderCount: shop._count.orders,
        },
        statusHistory: shop.statusHistories.map((h) => ({
          id: h.id,
          fromStatus: h.fromStatus,
          toStatus: h.toStatus,
          reason: h.reason,
          changedBy: h.changedBy,
          createdAt: h.createdAt,
        })),
      },
    };
  }

  async approve(id: string, adminId: string) {
    return this.transition(
      id,
      adminId,
      ShopStatus.aktif,
      null,
      AdminAction.APPROVE_SHOP,
    );
  }

  async reject(id: string, adminId: string, reason: string) {
    const clean = reason?.trim();
    if (!clean || clean.length < 10 || clean.length > 300) {
      throw new BadRequestException('Alasan penolakan wajib 10-300 karakter');
    }
    return this.transition(
      id,
      adminId,
      ShopStatus.ditolak,
      clean,
      AdminAction.REJECT_SHOP,
    );
  }

  async updateStatus(
    id: string,
    adminId: string,
    status: ShopStatus,
    reason?: string,
  ) {
    if (status !== ShopStatus.aktif && status !== ShopStatus.nonaktif) {
      throw new BadRequestException('Status tidak valid');
    }
    const clean = reason?.trim();
    if (status === ShopStatus.nonaktif) {
      if (!clean || clean.length < 10 || clean.length > 300) {
        throw new BadRequestException(
          'Alasan penonaktifan wajib 10-300 karakter',
        );
      }
    }
    const action =
      status === ShopStatus.aktif
        ? AdminAction.ACTIVATE_SHOP
        : AdminAction.DEACTIVATE_SHOP;
    return this.transition(id, adminId, status, clean || null, action);
  }

  private async transition(
    id: string,
    adminId: string,
    toStatus: ShopStatus,
    reason: string | null,
    action: AdminAction,
  ) {
    const shop = await this.prisma.shop.findUnique({ where: { id } });
    if (!shop) throw new NotFoundException('UMKM tidak ditemukan');
    this.assertTransition(shop.status, toStatus);

    const updated = await this.prisma.$transaction(async (tx) => {
      const fresh = await tx.shop.findUnique({ where: { id } });
      if (!fresh) throw new NotFoundException('UMKM tidak ditemukan');
      this.assertTransition(fresh.status, toStatus);

      const data: Prisma.ShopUpdateInput = {
        status: toStatus,
        statusReason: reason,
        statusHistories: {
          create: {
            fromStatus: fresh.status,
            toStatus,
            reason,
            changedById: adminId,
          },
        },
      };
      if (
        toStatus === ShopStatus.aktif &&
        fresh.status === ShopStatus.pending
      ) {
        data.verifiedAt = new Date();
        data.verifier = { connect: { id: adminId } };
      }
      const s = await tx.shop.update({
        where: { id },
        data,
        include: { owner: { select: { id: true, name: true, email: true } } },
      });
      await tx.adminLog.create({
        data: { adminId, action, targetType: 'SHOP', targetId: id, reason },
      });
      return s;
    });

    return updated;
  }

  private assertTransition(from: ShopStatus, to: ShopStatus) {
    const allowed: Record<string, ShopStatus[]> = {
      [ShopStatus.pending]: [ShopStatus.aktif, ShopStatus.ditolak],
      [ShopStatus.aktif]: [ShopStatus.nonaktif],
      [ShopStatus.nonaktif]: [ShopStatus.aktif],
      [ShopStatus.ditolak]: [ShopStatus.pending],
    };
    if (!(allowed[from] || []).includes(to)) {
      throw new ConflictException('Transisi status tidak valid');
    }
  }
}
