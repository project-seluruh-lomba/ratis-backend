import { Injectable, NotFoundException } from '@nestjs/common';
import { OrderStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  getPagination,
  parseDateEndWib,
  parseDateStartWib,
} from '../../common/utils/helpers';

const ORDER_STATUSES: OrderStatus[] = [
  OrderStatus.pending,
  OrderStatus.diproses,
  OrderStatus.selesai,
  OrderStatus.dibatalkan,
];

@Injectable()
export class AdminOrdersService {
  constructor(private prisma: PrismaService) {}

  async list(query: {
    status?: OrderStatus;
    shopId?: string;
    from?: string;
    to?: string;
    q?: string;
    sort?: 'terbaru' | 'terlama';
    page?: number;
    limit?: number;
  }) {
    const { page, limit, skip, take } = getPagination(query.page, query.limit);
    const baseWhere = this.buildWhere(query);
    const where: Prisma.OrderWhereInput = { ...baseWhere };
    if (query.status) where.status = query.status;

    const [filteredTotal, aggregate, grouped, orders] = await Promise.all([
      this.prisma.order.count({ where }),
      this.prisma.order.aggregate({
        where,
        _sum: { total: true },
      }),
      this.prisma.order.groupBy({
        by: ['status'],
        where: baseWhere,
        _count: { _all: true },
        orderBy: { status: 'asc' },
      }),
      this.prisma.order.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: query.sort === 'terlama' ? 'asc' : 'desc' },
        include: {
          shop: {
            select: {
              id: true,
              name: true,
              slug: true,
              nib: true,
              phone: true,
              address: true,
              owner: { select: { name: true } },
            },
          },
          customer: { select: { id: true, name: true } },
        },
      }),
    ]);

    const statusCounts = ORDER_STATUSES.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<OrderStatus, number>,
    );
    for (const row of grouped) {
      statusCounts[row.status] = row._count._all;
    }

    return {
      data: orders.map((order) => ({
        id: order.id,
        code: order.code,
        shopId: order.shopId,
        shopName: order.shop.name,
        shopSlug: order.shop.slug,
        shopOwner: order.shop.owner.name,
        shopNib: order.shop.nib,
        shopPhone: order.shop.phone,
        shopAddress: order.shop.address,
        customerId: order.customerId,
        customerName: order.customer.name,
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
      })),
      meta: { page, limit, total: filteredTotal },
      summary: {
        count: filteredTotal,
        totalValue: aggregate._sum.total ?? 0,
        statusCounts,
      },
    };
  }

  async detail(idOrCode: string) {
    const order = await this.prisma.order.findFirst({
      where: {
        OR: [{ id: idOrCode }, { code: idOrCode }],
      },
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            nib: true,
            phone: true,
            address: true,
            owner: { select: { id: true, name: true, email: true } },
          },
        },
        customer: { select: { id: true, name: true } },
        items: { orderBy: { id: 'asc' } },
        statusHistories: {
          orderBy: { createdAt: 'asc' },
          include: { changedBy: { select: { id: true, name: true } } },
        },
      },
    });
    if (!order) throw new NotFoundException('Pesanan tidak ditemukan');

    return {
      data: {
        id: order.id,
        code: order.code,
        shop: {
          id: order.shop.id,
          name: order.shop.name,
          slug: order.shop.slug,
          nib: order.shop.nib,
          phone: order.shop.phone,
          address: order.shop.address,
          ownerName: order.shop.owner.name,
          ownerEmail: order.shop.owner.email,
        },
        customer: { id: order.customer.id, name: order.customer.name },
        items: order.items.map((item) => ({
          id: item.id,
          name: item.productName,
          qty: item.quantity,
          unitPrice: item.unitPrice,
          subtotal: item.quantity * item.unitPrice,
        })),
        total: order.total,
        status: order.status,
        createdAt: order.createdAt,
        statusHistory: order.statusHistories.map((history) => ({
          id: history.id,
          fromStatus: history.fromStatus,
          toStatus: history.toStatus,
          note: history.note,
          changedBy: history.changedBy,
          createdAt: history.createdAt,
        })),
      },
    };
  }

  private buildWhere(query: {
    shopId?: string;
    from?: string;
    to?: string;
    q?: string;
  }): Prisma.OrderWhereInput {
    const where: Prisma.OrderWhereInput = {};
    if (query.shopId) where.shopId = query.shopId;
    if (query.q?.trim()) {
      where.code = { contains: query.q.trim() };
    }

    const from = parseDateStartWib(query.from);
    const to = parseDateEndWib(query.to);
    if (from || to) {
      where.createdAt = {
        ...(from ? { gte: from } : {}),
        ...(to ? { lte: to } : {}),
      };
    }
    return where;
  }
}
