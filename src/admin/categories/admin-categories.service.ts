import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminAction, type Category, type Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdminLogService } from '../../common/services/admin-log.service';
import { normalizeName, slugify } from '../../common/utils/helpers';

type CategoryWithCount = Category & { _count: { products: number } };

@Injectable()
export class AdminCategoriesService {
  constructor(
    private prisma: PrismaService,
    private adminLog: AdminLogService,
  ) {}

  async list(q?: string) {
    const categories = await this.prisma.category.findMany({
      where: q?.trim() ? { name: { contains: q.trim() } } : undefined,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { products: true } } },
    });
    return categories.map((c: CategoryWithCount) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      isActive: c.isActive,
      productCount: c._count.products,
      createdAt: c.createdAt,
    }));
  }

  async create(adminId: string, name: string) {
    const clean = this.cleanName(name);
    await this.assertUnique(clean);
    const slug = await this.uniqueSlug(slugify(clean) || 'kategori');
    const category = await this.prisma.category.create({
      data: { name: clean, slug },
    });
    await this.adminLog
      .record({
        adminId,
        action: AdminAction.CREATE_CATEGORY,
        targetType: 'CATEGORY',
        targetId: category.id,
      })
      .catch(() => undefined);
    return { ...category, productCount: 0 };
  }

  async update(
    adminId: string,
    id: string,
    dto: { name?: string; isActive?: boolean },
  ) {
    const existing = await this.prisma.category.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Kategori tidak ditemukan');
    const data: Prisma.CategoryUpdateInput = {};
    if (dto.name !== undefined) {
      const clean = this.cleanName(dto.name);
      await this.assertUnique(clean, id);
      data.name = clean;
      data.slug = await this.uniqueSlug(slugify(clean) || 'kategori', id);
    }
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    const category = await this.prisma.category.update({
      where: { id },
      data,
      include: { _count: { select: { products: true } } },
    });
    await this.adminLog
      .record({
        adminId,
        action: AdminAction.UPDATE_CATEGORY,
        targetType: 'CATEGORY',
        targetId: id,
      })
      .catch(() => undefined);
    return {
      id: category.id,
      name: category.name,
      slug: category.slug,
      isActive: category.isActive,
      productCount: category._count.products,
      createdAt: category.createdAt,
    };
  }

  async remove(adminId: string, id: string) {
    const existing = await this.prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });
    if (!existing) throw new NotFoundException('Kategori tidak ditemukan');
    if (existing._count.products > 0) {
      throw new ConflictException(
        'Kategori masih dipakai produk. Nonaktifkan kategori ini.',
      );
    }
    await this.prisma.category.delete({ where: { id } });
    await this.adminLog
      .record({
        adminId,
        action: AdminAction.DELETE_CATEGORY,
        targetType: 'CATEGORY',
        targetId: id,
      })
      .catch(() => undefined);
    return { deleted: true };
  }

  private cleanName(name: string) {
    const clean = name.trim().replace(/\s+/g, ' ');
    if (clean.length < 2 || clean.length > 40)
      throw new BadRequestException('Nama kategori harus 2-40 karakter');
    return clean;
  }

  private async assertUnique(name: string, excludeId?: string) {
    const all = await this.prisma.category.findMany({
      select: { id: true, name: true },
    });
    const dup = all.find(
      (c) =>
        c.id !== excludeId && normalizeName(c.name) === normalizeName(name),
    );
    if (dup) throw new ConflictException('Nama kategori sudah digunakan');
  }

  private async uniqueSlug(base: string, excludeId?: string) {
    let slug = base;
    let i = 2;
    for (;;) {
      const found = await this.prisma.category.findUnique({ where: { slug } });
      if (!found || found.id === excludeId) return slug;
      slug = `${base}-${i++}`;
    }
  }
}
