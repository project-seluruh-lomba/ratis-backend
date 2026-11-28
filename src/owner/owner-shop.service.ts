import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ShopStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ResubmitShopDto } from './dto/resubmit-shop.dto';

@Injectable()
export class OwnerShopService {
  constructor(private prisma: PrismaService) {}

  async getOwnShop(ownerId: string) {
    const shop = await this.prisma.shop.findUnique({
      where: { ownerId },
      include: {
        statusHistories: {
          orderBy: { createdAt: 'desc' },
          include: { changedBy: { select: { id: true, name: true } } },
        },
        _count: { select: { products: true, orders: true } },
      },
    });
    if (!shop) throw new NotFoundException('Toko belum terdaftar');

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
        summary: {
          productCount: shop._count.products,
          orderCount: shop._count.orders,
        },
        statusHistory: shop.statusHistories.map((history) => ({
          id: history.id,
          fromStatus: history.fromStatus,
          toStatus: history.toStatus,
          reason: history.reason,
          changedBy: history.changedBy,
          createdAt: history.createdAt,
        })),
      },
    };
  }

  async resubmit(ownerId: string, dto: ResubmitShopDto) {
    const shop = await this.prisma.shop.findUnique({ where: { ownerId } });
    if (!shop) throw new NotFoundException('Toko belum terdaftar');
    if (shop.status !== ShopStatus.ditolak) {
      throw new ConflictException(
        'Hanya pendaftaran berstatus ditolak yang dapat diajukan ulang',
      );
    }

    const data: Prisma.ShopUpdateInput = {
      status: ShopStatus.pending,
      statusReason: null,
    };
    if (dto.shopName !== undefined) data.name = dto.shopName.trim();
    if (dto.phone !== undefined) data.phone = dto.phone.trim();
    if (dto.address !== undefined) data.address = dto.address.trim();
    if (dto.description !== undefined) data.description = dto.description.trim();
    if (dto.photoUrl !== undefined) data.photoUrl = dto.photoUrl.trim() || null;
    if (dto.nib !== undefined) data.nib = dto.nib;

    try {
      const updated = await this.prisma.$transaction(async (tx) => {
        const fresh = await tx.shop.findUnique({ where: { ownerId } });
        if (!fresh) throw new NotFoundException('Toko belum terdaftar');
        if (fresh.status !== ShopStatus.ditolak) {
          throw new ConflictException(
            'Status toko sudah berubah, muat ulang halaman terlebih dahulu',
          );
        }
        return tx.shop.update({
          where: { id: fresh.id },
          data: {
            ...data,
            statusHistories: {
              create: {
                fromStatus: ShopStatus.ditolak,
                toStatus: ShopStatus.pending,
                reason: 'Pengajuan ulang oleh pemilik',
                changedById: ownerId,
              },
            },
          },
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            updatedAt: true,
          },
        });
      });
      return { data: updated };
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('NIB sudah dipakai toko lain');
      }
      throw error;
    }
  }
}
