import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrderStatus, Prisma, ShopStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { getPagination } from '../common/utils/helpers';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class StorefrontService {
  constructor(private prisma: PrismaService) {}

  async listShops(query: { q?: string; page?: number; limit?: number }) {
    const { page, limit, skip, take } = getPagination(query.page, query.limit);
    const where: Prisma.ShopWhereInput = { status: ShopStatus.aktif };
    if (query.q?.trim()) {
      const q = query.q.trim();
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
      ];
    }

    const [total, shops] = await this.prisma.$transaction([
      this.prisma.shop.count({ where }),
      this.prisma.shop.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          description: true,
          photoUrl: true,
          _count: { select: { products: true } },
        },
      }),
    ]);

    return {
      data: shops.map((shop) => ({
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        description: shop.description,
        photoUrl: shop.photoUrl,
        productCount: shop._count.products,
      })),
      meta: { page, limit, total },
    };
  }

  async getShopBySlug(slug: string) {
    const shop = await this.prisma.shop.findFirst({
      where: { slug, status: ShopStatus.aktif },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        address: true,
        photoUrl: true,
        products: {
          where: { isActive: true },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            category: { select: { id: true, name: true, slug: true } },
          },
        },
      },
    });
    if (!shop) throw new NotFoundException('Toko tidak ditemukan');
    return { data: shop };
  }

  async listCategories() {
    const categories = await this.prisma.category.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, slug: true },
    });
    return { data: categories };
  }

  async createOrder(customerId: string, dto: CreateOrderDto) {
    return this.prisma.$transaction(async (tx) => {
      const shop = await tx.shop.findUnique({
        where: { slug: dto.shopSlug },
        select: { id: true, name: true, status: true },
      });
      if (!shop) throw new NotFoundException('Toko tidak ditemukan');
      if (shop.status !== ShopStatus.aktif) {
        throw new ConflictException(
          'Toko sedang tidak aktif sehingga tidak menerima pesanan baru',
        );
      }

      const qtyByProduct = new Map<string, number>();
      for (const item of dto.items) {
        qtyByProduct.set(
          item.productId,
          (qtyByProduct.get(item.productId) ?? 0) + item.quantity,
        );
      }
      const productIds = [...qtyByProduct.keys()];
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, shopId: shop.id, isActive: true },
        select: { id: true, name: true, price: true, stock: true },
      });
      if (products.length !== productIds.length) {
        throw new BadRequestException(
          'Ada produk yang tidak valid atau sudah tidak dijual',
        );
      }

      let total = 0;
      for (const product of products) {
        const qty = qtyByProduct.get(product.id) ?? 0;
        if (product.stock < qty) {
          throw new ConflictException(
            `Stok ${product.name} tidak mencukupi`,
          );
        }
        total += product.price * qty;
      }
      if (total <= 0) {
        throw new BadRequestException('Pesanan tidak berisi produk');
      }

      const code = await this.nextOrderCode(tx);
      const order = await tx.order.create({
        data: {
          code,
          shopId: shop.id,
          customerId,
          total,
          status: OrderStatus.pending,
          items: {
            create: products.map((product) => ({
              productName: product.name,
              quantity: qtyByProduct.get(product.id) ?? 0,
              unitPrice: product.price,
            })),
          },
          statusHistories: {
            create: {
              fromStatus: null,
              toStatus: OrderStatus.pending,
              note: 'Pesanan dibuat pelanggan',
              changedById: customerId,
            },
          },
        },
        include: { items: true },
      });

      for (const product of products) {
        await tx.product.update({
          where: { id: product.id },
          data: { stock: { decrement: qtyByProduct.get(product.id) ?? 0 } },
        });
      }

      return {
        data: {
          id: order.id,
          code: order.code,
          shop: { id: shop.id, name: shop.name },
          total: order.total,
          status: order.status,
          createdAt: order.createdAt,
          items: order.items.map((item) => ({
            id: item.id,
            name: item.productName,
            qty: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: item.quantity * item.unitPrice,
          })),
        },
      };
    });
  }

  private async nextOrderCode(
    tx: Prisma.TransactionClient,
  ): Promise<string> {
    const stamp = new Date()
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '');
    for (let i = 0; i < 20; i++) {
      const code = `#ORD-${stamp}-${Math.random()
        .toString(36)
        .slice(2, 6)
        .toUpperCase()}`;
      const found = await tx.order.findUnique({ where: { code } });
      if (!found) return code;
    }
    throw new ConflictException('Gagal membuat kode pesanan, coba lagi');
  }
}
