import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminAction, Prisma, UserRole } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { getPagination } from '../../common/utils/helpers';
import { AdminLogService } from '../../common/services/admin-log.service';

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  ownedShop: { select: { id: true, name: true, slug: true, phone: true } },
  staffShop: { select: { id: true, name: true, slug: true, phone: true } },
} satisfies Prisma.UserSelect;

type UserWithShop = Prisma.UserGetPayload<{ select: typeof USER_SELECT }>;

@Injectable()
export class AdminUsersService {
  constructor(
    private prisma: PrismaService,
    private adminLog: AdminLogService,
  ) {}

  async list(query: {
    role?: UserRole;
    isActive?: boolean;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const { page, limit, skip, take } = getPagination(query.page, query.limit);
    const where: Prisma.UserWhereInput = {};
    if (query.role) where.role = query.role;
    if (query.isActive !== undefined) where.isActive = query.isActive;
    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [{ name: { contains: q } }, { email: { contains: q } }];
    }

    const [
      total,
      users,
      adminCount,
      ownerCount,
      staffCount,
      customerCount,
      inactiveCount,
      activeAdmins,
    ] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: USER_SELECT,
      }),
      this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
      this.prisma.user.count({ where: { role: UserRole.OWNER } }),
      this.prisma.user.count({ where: { role: UserRole.STAFF } }),
      this.prisma.user.count({ where: { role: UserRole.CUSTOMER } }),
      this.prisma.user.count({ where: { isActive: false } }),
      this.prisma.user.count({
        where: { role: UserRole.ADMIN, isActive: true },
      }),
    ]);

    const roles: Record<UserRole, number> = {
      ADMIN: adminCount,
      OWNER: ownerCount,
      STAFF: staffCount,
      CUSTOMER: customerCount,
    };
    const allTotal = adminCount + ownerCount + staffCount + customerCount;

    return {
      data: users.map((user) => this.mapUser(user)),
      meta: { page, limit, total },
      summary: {
        total: allTotal,
        roles,
        inactive: inactiveCount,
        activeAdmins,
      },
    };
  }

  async updateStatus(
    adminId: string,
    id: string,
    isActive: boolean,
    reason?: string,
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: USER_SELECT,
    });
    if (!user) throw new NotFoundException('Pengguna tidak ditemukan');

    if (!isActive) {
      if (user.id === adminId) {
        throw new ForbiddenException(
          'Akun yang sedang Anda gunakan tidak dapat dinonaktifkan',
        );
      }
      if (user.role === UserRole.ADMIN && user.isActive) {
        const activeAdmins = await this.prisma.user.count({
          where: { role: UserRole.ADMIN, isActive: true },
        });
        if (activeAdmins <= 1) {
          throw new ConflictException(
            'Admin aktif terakhir tidak dapat dinonaktifkan',
          );
        }
      }
    }

    if (user.isActive === isActive) {
      return { data: this.mapUser(user) };
    }

    const cleanReason = reason?.trim() || null;
    const action = isActive
      ? AdminAction.ACTIVATE_USER
      : AdminAction.DEACTIVATE_USER;

    const updated = await this.prisma.$transaction(async (tx) => {
      const next = await tx.user.update({
        where: { id },
        data: { isActive },
        select: USER_SELECT,
      });
      await tx.adminLog.create({
        data: {
          adminId,
          action,
          targetType: 'USER',
          targetId: id,
          reason: cleanReason,
        },
      });
      return next;
    });

    return { data: this.mapUser(updated) };
  }

  private mapUser(user: UserWithShop) {
    const shop = user.ownedShop ?? user.staffShop;
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      shopId: shop?.id ?? null,
      shopName: shop?.name ?? null,
      shopSlug: shop?.slug ?? null,
      phone: shop?.phone ?? null,
    };
  }
}
