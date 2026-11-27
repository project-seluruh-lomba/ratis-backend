import 'dotenv/config';
import {
  PrismaClient,
  UserRole,
  ShopStatus,
  OrderStatus,
  PayoutStatus,
} from '@prisma/client';
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

  const now = new Date();
  const monthKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const payoutDefs = [
    { seq: '094', shop: 'kopi-nusantara', bank: 'Bank BCA', account: '8045-9812-90', method: 'BI-FAST', netAmount: 1_845_000, commission: 18_650, status: PayoutStatus.menunggu, daysAgo: 0 },
    { seq: '093', shop: 'batik-sekar', bank: 'Bank Mandiri', account: '1370-0199-2810', method: 'Realtime RTGS', netAmount: 4_210_000, commission: 42_500, status: PayoutStatus.menunggu, daysAgo: 0 },
    { seq: '092', shop: 'keripik-jaya', bank: 'Bank BRI', account: '0206-0105-9921', method: 'BI-FAST', netAmount: 980_000, commission: 9_900, status: PayoutStatus.berhasil, daysAgo: 1 },
    { seq: '091', shop: 'batik-sekar', bank: 'Bank BNI', account: '0941-2098-44', method: 'Kliring SKN', netAmount: 6_450_000, commission: 129_000, status: PayoutStatus.diverifikasi, daysAgo: 1 },
    { seq: '090', shop: 'kopi-nusantara', bank: 'BS Syariah', account: '7120-4491-02', method: 'BI-FAST', netAmount: 1_155_000, commission: 11_660, status: PayoutStatus.terkirim, daysAgo: 1 },
    { seq: '089', shop: 'keripik-jaya', bank: 'Bank Mandiri', account: '1370-2114-8890', method: 'Realtime RTGS', netAmount: 2_760_000, commission: 27_600, status: PayoutStatus.menunggu, daysAgo: 2 },
    { seq: '088', shop: 'kopi-nusantara', bank: 'Bank BCA', account: '8045-1120-77', method: 'BI-FAST', netAmount: 3_320_000, commission: 33_200, status: PayoutStatus.diverifikasi, daysAgo: 2 },
    { seq: '087', shop: 'batik-sekar', bank: 'Bank BRI', account: '0206-0112-8834', method: 'BI-FAST', netAmount: 5_890_000, commission: 58_900, status: PayoutStatus.berhasil, daysAgo: 3 },
    { seq: '086', shop: 'keripik-jaya', bank: 'Bank BNI', account: '0941-2280-15', method: 'Kliring SKN', netAmount: 740_000, commission: 7_400, status: PayoutStatus.terkirim, daysAgo: 3 },
    { seq: '085', shop: 'kopi-nusantara', bank: 'BS Syariah', account: '7120-5581-90', method: 'BI-FAST', netAmount: 2_180_000, commission: 21_800, status: PayoutStatus.menunggu, daysAgo: 4 },
  ];
  for (const p of payoutDefs) {
    const shop = shops[p.shop].shop;
    const id = `#PAY-${monthKey}-${p.seq}`;
    const data = {
      shopId: shop.id,
      bank: p.bank,
      account: p.account,
      method: p.method,
      netAmount: p.netAmount,
      commission: p.commission,
      status: p.status,
      submittedAt: daysAgo(p.daysAgo),
    };
    await prisma.payout.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  console.log('Seed selesai:', { admin: adminEmail });
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
