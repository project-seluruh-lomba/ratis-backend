import 'dotenv/config';
import { PrismaClient, UserRole, ShopStatus, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

async function main() {
  const adminEmail = (process.env.ADMIN_SEED_EMAIL || 'admin@ratis.id').toLowerCase();
  const adminPass = process.env.ADMIN_SEED_PASSWORD || 'Admin123!';
  const passwordHash = await bcrypt.hash(adminPass, 10);
  const defaultHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: 'Admin Ratis', role: UserRole.ADMIN, isActive: true, passwordHash },
    create: { email: adminEmail, name: 'Admin Ratis', role: UserRole.ADMIN, isActive: true, passwordHash },
  });

  const categoryData = [
    { name: 'Makanan', slug: 'makanan' },
    { name: 'Minuman', slug: 'minuman' },
    { name: 'Kerajinan', slug: 'kerajinan' },
    { name: 'Fashion', slug: 'fashion' },
    { name: 'Pertanian', slug: 'pertanian' },
    { name: 'Jasa', slug: 'jasa' },
  ];
  const categories: Record<string, any> = {};
  for (const c of categoryData) {
    categories[c.slug] = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, isActive: true },
      create: { name: c.name, slug: c.slug, isActive: true },
    });
  }

  const ownerDefs = [
    { email: 'owner.pending1@ratis.id', name: 'Budi Pending', shop: 'Warung Pending Satu', slug: 'warung-pending-satu', status: ShopStatus.pending, nib: null },
    { email: 'owner.pending2@ratis.id', name: 'Sari Pending', shop: 'Toko Pending Dua', slug: 'toko-pending-dua', status: ShopStatus.pending, nib: '1234567890123' },
    { email: 'owner.aktif1@ratis.id', name: 'Andi Aktif', shop: 'Kopi Nusantara', slug: 'kopi-nusantara', status: ShopStatus.aktif, nib: '1234567890124' },
    { email: 'owner.aktif2@ratis.id', name: 'Rina Aktif', shop: 'Batik Sekar', slug: 'batik-sekar', status: ShopStatus.aktif, nib: '1234567890125' },
    { email: 'owner.aktif3@ratis.id', name: 'Dedi Aktif', shop: 'Keripik Jaya', slug: 'keripik-jaya', status: ShopStatus.aktif, nib: '1234567890126' },
    { email: 'owner.ditolak@ratis.id', name: 'Lina Ditolak', shop: 'Toko Ditolak', slug: 'toko-ditolak', status: ShopStatus.ditolak, nib: '1234567890127' },
    { email: 'owner.nonaktif@ratis.id', name: 'Tono Nonaktif', shop: 'Toko Nonaktif', slug: 'toko-nonaktif', status: ShopStatus.nonaktif, nib: '1234567890128' },
  ];

  const shops: Record<string, any> = {};
  const verifiedStatuses: ShopStatus[] = [ShopStatus.aktif, ShopStatus.ditolak, ShopStatus.nonaktif];
  for (const o of ownerDefs) {
    const owner = await prisma.user.upsert({
      where: { email: o.email },
      update: { name: o.name, role: UserRole.OWNER, isActive: true, passwordHash: defaultHash },
      create: { email: o.email, name: o.name, role: UserRole.OWNER, isActive: true, passwordHash: defaultHash },
    });
    const isVerified = verifiedStatuses.includes(o.status);
    const shop = await prisma.shop.upsert({
      where: { ownerId: owner.id },
      update: {
        name: o.shop, slug: o.slug, description: `Deskripsi ${o.shop}`, phone: '081234567890', address: 'Jl. Contoh No.1',
        nib: o.nib, status: o.status,
        statusReason: o.status === ShopStatus.ditolak ? 'Data usaha belum lengkap' : o.status === ShopStatus.nonaktif ? 'Melanggar ketentuan platform' : null,
        verifiedById: isVerified ? admin.id : null,
        verifiedAt: isVerified ? new Date() : null,
      },
      create: {
        ownerId: owner.id, name: o.shop, slug: o.slug, description: `Deskripsi ${o.shop}`, phone: '081234567890', address: 'Jl. Contoh No.1',
        nib: o.nib, status: o.status,
        statusReason: o.status === ShopStatus.ditolak ? 'Data usaha belum lengkap' : o.status === ShopStatus.nonaktif ? 'Melanggar ketentuan platform' : null,
        verifiedById: isVerified ? admin.id : null,
        verifiedAt: isVerified ? new Date() : null,
      },
    });
    shops[o.slug] = { shop, owner };
    const existingHistory = await prisma.shopStatusHistory.count({ where: { shopId: shop.id } });
    if (existingHistory === 0) {
      await prisma.shopStatusHistory.create({ data: { shopId: shop.id, fromStatus: null, toStatus: o.status, reason: shop.statusReason, changedById: admin.id } });
    }
  }

  const extraUsers = [
    { email: 'staff1@ratis.id', name: 'Staf Satu', role: UserRole.STAFF },
    { email: 'staff2@ratis.id', name: 'Staf Dua', role: UserRole.STAFF },
    { email: 'cust1@ratis.id', name: 'Pelanggan Satu', role: UserRole.CUSTOMER },
    { email: 'cust2@ratis.id', name: 'Pelanggan Dua', role: UserRole.CUSTOMER },
    { email: 'cust3@ratis.id', name: 'Pelanggan Tiga', role: UserRole.CUSTOMER },
  ];
  for (const u of extraUsers) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, isActive: true, passwordHash: defaultHash },
      create: { email: u.email, name: u.name, role: u.role, isActive: true, passwordHash: defaultHash },
    });
  }

  const productDefs = [
    { shop: 'kopi-nusantara', cat: 'minuman', name: 'Kopi Arabika', price: 35000, stock: 50 },
    { shop: 'kopi-nusantara', cat: 'minuman', name: 'Kopi Robusta', price: 30000, stock: 40 },
    { shop: 'batik-sekar', cat: 'fashion', name: 'Batik Tulis', price: 250000, stock: 10 },
    { shop: 'batik-sekar', cat: 'kerajinan', name: 'Selendang Batik', price: 120000, stock: 15 },
    { shop: 'keripik-jaya', cat: 'makanan', name: 'Keripik Singkong', price: 15000, stock: 100 },
    { shop: 'keripik-jaya', cat: 'makanan', name: 'Keripik Pisang', price: 18000, stock: 80 },
  ];
  for (const p of productDefs) {
    const shop = shops[p.shop].shop;
    const cat = categories[p.cat];
    const existing = await prisma.product.findFirst({ where: { shopId: shop.id, name: p.name } });
    if (!existing) {
      await prisma.product.create({ data: { shopId: shop.id, categoryId: cat.id, name: p.name, price: p.price, stock: p.stock, isActive: true } });
    }
  }

  const statuses = [OrderStatus.pending, OrderStatus.diproses, OrderStatus.selesai, OrderStatus.dibatalkan];
  const activeShops = ['kopi-nusantara', 'batik-sekar', 'keripik-jaya'];
  const customers = await prisma.user.findMany({ where: { role: UserRole.CUSTOMER } });
  for (let i = 1; i <= 30; i++) {
    const code = `ORD-${String(i).padStart(4, '0')}`;
    const shopSlug = activeShops[i % activeShops.length];
    const shop = shops[shopSlug].shop;
    const customer = customers[i % customers.length];
    const status = statuses[i % statuses.length];
    const total = 20000 + i * 5000;
    const createdAt = daysAgo(i % 14);
    const existing = await prisma.order.findUnique({ where: { code } });
    if (!existing) {
      await prisma.order.create({
        data: {
          code, shopId: shop.id, customerId: customer.id, total, status, createdAt,
          items: { create: [{ productName: `Produk ${i}`, quantity: 1 + (i % 3), unitPrice: Math.floor(total / (1 + (i % 3))) }] },
        },
      });
    }
  }

  console.log('Seed selesai:', { admin: adminEmail });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
