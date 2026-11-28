import 'dotenv/config';
import {
  AdminAction,
  OrderStatus,
  PayoutStatus,
  PrismaClient,
  ShopStatus,
  UserRole,
} from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function daysAgo(n: number, hour = 10, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  date.setHours(hour, minute, 0, 0);
  return date;
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

type ShopSeed = {
  email: string;
  ownerName: string;
  shopName: string;
  slug: string;
  status: ShopStatus;
  nib: string | null;
  description: string;
  phone: string;
  address: string;
  createdAt: Date;
  statusReason: string | null;
};

const ownerDefs: ShopSeed[] = [
  {
    email: 'owner.pending1@ratis.id',
    ownerName: 'Sari Wulandari',
    shopName: 'Warung Bu Sari',
    slug: 'warung-bu-sari',
    status: ShopStatus.pending,
    nib: null,
    description:
      'Warung makan rumahan dengan menu masakan Jawa sehari-hari, melayani pesanan nasi kotak dan katering kecil.',
    phone: '0812-3344-5566',
    address: 'Jl. Kebon Jeruk No. 14, RT 03/RW 02, Bantul, D.I. Yogyakarta',
    createdAt: daysAgo(0, 8, 15),
    statusReason: null,
  },
  {
    email: 'owner.pending2@ratis.id',
    ownerName: 'Ahmad Subagyo',
    shopName: 'Kripik Tempe Barokah',
    slug: 'kripik-tempe-barokah',
    status: ShopStatus.pending,
    nib: '1234567890123',
    description:
      'Produsen camilan tempe dan keripik singkong dengan bahan baku lokal, cocok untuk oleh-oleh.',
    phone: '0813-2211-8899',
    address: 'Jl. Raya Malang No. 88, Kab. Malang, Jawa Timur',
    createdAt: daysAgo(1, 14, 5),
    statusReason: null,
  },
  {
    email: 'owner.aktif1@ratis.id',
    ownerName: 'Bagas Pratama',
    shopName: 'Kopi Nusantara Lestari',
    slug: 'kopi-nusantara-lestari',
    status: ShopStatus.aktif,
    nib: '1234567890124',
    description:
      'Kedai kopi yang menyediakan biji kopi single origin dari petani Gayo, Lampung, dan Toraja.',
    phone: '0821-9988-1234',
    address: 'Jl. Braga No. 21, Kota Bandung, Jawa Barat',
    createdAt: daysAgo(45, 9, 30),
    statusReason: null,
  },
  {
    email: 'owner.aktif2@ratis.id',
    ownerName: 'Sekar Ayu',
    shopName: 'Batik Sekar Wangi',
    slug: 'batik-sekar-wangi',
    status: ShopStatus.aktif,
    nib: '1234567890125',
    description:
      'Pengrajin batik tulis dan cap dengan motif tradisional Solo, menerima pesanan seragam dan kain panjang.',
    phone: '0857-1122-3344',
    address: 'Jl. Slamet Riyadi No. 102, Kota Surakarta, Jawa Tengah',
    createdAt: daysAgo(60, 11, 0),
    statusReason: null,
  },
  {
    email: 'owner.aktif3@ratis.id',
    ownerName: 'Dewi Lestari',
    shopName: 'Keripik Tempe Mbok Nem',
    slug: 'keripik-tempe-mbok-nem',
    status: ShopStatus.aktif,
    nib: '1234567890126',
    description:
      'Camilan keripik tempe dan pisang dengan resep keluarga, digoreng harian tanpa pengawet.',
    phone: '0819-7766-0099',
    address: 'Jl. Soekarno Hatta No. 45, Kota Malang, Jawa Timur',
    createdAt: daysAgo(30, 8, 45),
    statusReason: null,
  },
  {
    email: 'owner.ditolak@ratis.id',
    ownerName: 'Elly Kusnadi',
    shopName: 'Dapur Oma Elly',
    slug: 'dapur-oma-elly',
    status: ShopStatus.ditolak,
    nib: '1234567890127',
    description: 'Katering rumahan untuk acara keluarga dan kantor.',
    phone: '0812-0000-1122',
    address: 'Jl. Pajajaran No. 5, Kota Bogor, Jawa Barat',
    createdAt: daysAgo(7, 10, 20),
    statusReason:
      'Alamat usaha belum lengkap dan nomor kontak tidak dapat dihubungi saat verifikasi.',
  },
  {
    email: 'owner.nonaktif@ratis.id',
    ownerName: 'Nur Aisyah',
    shopName: 'Toko Berkah Jaya',
    slug: 'toko-berkah-jaya',
    status: ShopStatus.nonaktif,
    nib: '1234567890128',
    description: 'Toko sembako dan kebutuhan rumah tangga harian.',
    phone: '0813-4455-6677',
    address: 'Jl. Margonda Raya No. 210, Kota Depok, Jawa Barat',
    createdAt: daysAgo(90, 9, 10),
    statusReason:
      'Melanggar ketentuan platform: ditemukan indikasi pesanan fiktif berulang.',
  },
];

const categoryData = [
  { name: 'Makanan', slug: 'makanan' },
  { name: 'Minuman', slug: 'minuman' },
  { name: 'Kerajinan', slug: 'kerajinan' },
  { name: 'Fashion', slug: 'fashion' },
  { name: 'Pertanian', slug: 'pertanian' },
  { name: 'Jasa', slug: 'jasa' },
];

type ProductSeed = {
  shopSlug: string;
  categorySlug: string;
  name: string;
  price: number;
  stock: number;
};

const productDefs: ProductSeed[] = [
  {
    shopSlug: 'kopi-nusantara-lestari',
    categorySlug: 'minuman',
    name: 'Kopi Arabika Gayo 200g',
    price: 45000,
    stock: 50,
  },
  {
    shopSlug: 'kopi-nusantara-lestari',
    categorySlug: 'minuman',
    name: 'Kopi Robusta Lampung 200g',
    price: 38000,
    stock: 40,
  },
  {
    shopSlug: 'kopi-nusantara-lestari',
    categorySlug: 'minuman',
    name: 'Cold Brew Botol 250ml',
    price: 25000,
    stock: 30,
  },
  {
    shopSlug: 'batik-sekar-wangi',
    categorySlug: 'fashion',
    name: 'Batik Tulis Motif Parang',
    price: 320000,
    stock: 10,
  },
  {
    shopSlug: 'batik-sekar-wangi',
    categorySlug: 'kerajinan',
    name: 'Selendang Batik Sutra',
    price: 120000,
    stock: 15,
  },
  {
    shopSlug: 'batik-sekar-wangi',
    categorySlug: 'fashion',
    name: 'Kemeja Batik Pria Lengan Panjang',
    price: 185000,
    stock: 12,
  },
  {
    shopSlug: 'keripik-tempe-mbok-nem',
    categorySlug: 'makanan',
    name: 'Keripik Tempe Original 250g',
    price: 18000,
    stock: 100,
  },
  {
    shopSlug: 'keripik-tempe-mbok-nem',
    categorySlug: 'makanan',
    name: 'Keripik Pisang Cokelat 200g',
    price: 22000,
    stock: 80,
  },
  {
    shopSlug: 'keripik-tempe-mbok-nem',
    categorySlug: 'makanan',
    name: 'Keripik Singkong Balado 200g',
    price: 16000,
    stock: 90,
  },
];

const extraUsers = [
  {
    email: 'staff1@ratis.id',
    name: 'Bagus Anugrah',
    role: UserRole.STAFF,
    shopSlug: 'kopi-nusantara-lestari',
  },
  {
    email: 'staff2@ratis.id',
    name: 'Siti Rahayu',
    role: UserRole.STAFF,
    shopSlug: 'batik-sekar-wangi',
  },
  {
    email: 'cust1@ratis.id',
    name: 'Dian Nugraha',
    role: UserRole.CUSTOMER,
    shopSlug: null,
  },
  {
    email: 'cust2@ratis.id',
    name: 'Maya Hapsari',
    role: UserRole.CUSTOMER,
    shopSlug: null,
  },
  {
    email: 'cust3@ratis.id',
    name: 'Rizky Ramadhan',
    role: UserRole.CUSTOMER,
    shopSlug: null,
  },
];

const orderStatusPattern: OrderStatus[] = [
  OrderStatus.selesai,
  OrderStatus.selesai,
  OrderStatus.diproses,
  OrderStatus.pending,
  OrderStatus.selesai,
  OrderStatus.dibatalkan,
  OrderStatus.diproses,
  OrderStatus.selesai,
  OrderStatus.pending,
  OrderStatus.selesai,
  OrderStatus.diproses,
  OrderStatus.selesai,
  OrderStatus.dibatalkan,
  OrderStatus.selesai,
  OrderStatus.diproses,
  OrderStatus.pending,
  OrderStatus.selesai,
  OrderStatus.selesai,
  OrderStatus.diproses,
  OrderStatus.dibatalkan,
  OrderStatus.selesai,
  OrderStatus.pending,
  OrderStatus.diproses,
  OrderStatus.selesai,
  OrderStatus.selesai,
  OrderStatus.dibatalkan,
  OrderStatus.diproses,
  OrderStatus.pending,
  OrderStatus.selesai,
  OrderStatus.selesai,
];

async function main() {
  const adminEmail = (
    process.env.ADMIN_SEED_EMAIL || 'admin@ratis.id'
  ).toLowerCase();
  const adminPass = process.env.ADMIN_SEED_PASSWORD || 'Admin123!';
  const passwordHash = await bcrypt.hash(adminPass, 10);
  const defaultHash = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Admin Ratis',
      role: UserRole.ADMIN,
      isActive: true,
      passwordHash,
    },
    create: {
      email: adminEmail,
      name: 'Admin Ratis',
      role: UserRole.ADMIN,
      isActive: true,
      passwordHash,
    },
  });

  const categories: Record<string, { id: string; createdAt: Date }> = {};
  for (const category of categoryData) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, isActive: true },
      create: { name: category.name, slug: category.slug, isActive: true },
    });
    categories[category.slug] = saved;
  }

  const shops: Record<
    string,
    { shop: { id: string; name: string }; owner: { id: string; name: string } }
  > = {};

  for (const def of ownerDefs) {
    const owner = await prisma.user.upsert({
      where: { email: def.email },
      update: {
        name: def.ownerName,
        role: UserRole.OWNER,
        isActive: true,
        passwordHash: defaultHash,
      },
      create: {
        email: def.email,
        name: def.ownerName,
        role: UserRole.OWNER,
        isActive: true,
        passwordHash: defaultHash,
      },
    });

    const verified = def.status !== ShopStatus.pending;
    const shop = await prisma.shop.upsert({
      where: { ownerId: owner.id },
      update: {
        name: def.shopName,
        slug: def.slug,
        description: def.description,
        phone: def.phone,
        address: def.address,
        nib: def.nib,
        status: def.status,
        statusReason: def.statusReason,
        verifiedById: verified ? admin.id : null,
        verifiedAt: verified ? def.createdAt : null,
        createdAt: def.createdAt,
      },
      create: {
        ownerId: owner.id,
        name: def.shopName,
        slug: def.slug,
        description: def.description,
        phone: def.phone,
        address: def.address,
        nib: def.nib,
        status: def.status,
        statusReason: def.statusReason,
        verifiedById: verified ? admin.id : null,
        verifiedAt: verified ? def.createdAt : null,
        createdAt: def.createdAt,
      },
    });
    shops[def.slug] = { shop, owner };

    const historyCount = await prisma.shopStatusHistory.count({
      where: { shopId: shop.id },
    });
    if (historyCount === 0) {
      await prisma.shopStatusHistory.create({
        data: {
          shopId: shop.id,
          fromStatus: null,
          toStatus: ShopStatus.pending,
          reason: null,
          changedById: null,
          createdAt: def.createdAt,
        },
      });
      if (def.status !== ShopStatus.pending) {
        await prisma.shopStatusHistory.create({
          data: {
            shopId: shop.id,
            fromStatus: ShopStatus.pending,
            toStatus: def.status,
            reason: def.statusReason,
            changedById: admin.id,
            createdAt: addMinutes(def.createdAt, 60 * 24),
          },
        });
      }
    }
  }

  for (const user of extraUsers) {
    const staffShopId = user.shopSlug
      ? shops[user.shopSlug]?.shop.id
      : null;
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        role: user.role,
        isActive: true,
        passwordHash: defaultHash,
        staffShopId,
      },
      create: {
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: true,
        passwordHash: defaultHash,
        staffShopId,
      },
    });
  }

  const productsByShop: Record<
    string,
    { id: string; name: string; price: number }[]
  > = {};

  for (const def of productDefs) {
    const shop = shops[def.shopSlug]?.shop;
    const category = categories[def.categorySlug];
    if (!shop || !category) continue;

    const existing = await prisma.product.findFirst({
      where: { shopId: shop.id, name: def.name },
    });
    const product = existing
      ? await prisma.product.update({
          where: { id: existing.id },
          data: {
            categoryId: category.id,
            price: def.price,
            stock: def.stock,
            isActive: true,
          },
        })
      : await prisma.product.create({
          data: {
            shopId: shop.id,
            categoryId: category.id,
            name: def.name,
            price: def.price,
            stock: def.stock,
            isActive: true,
          },
        });

    productsByShop[def.shopSlug] ??= [];
    productsByShop[def.shopSlug].push({
      id: product.id,
      name: product.name,
      price: product.price,
    });
  }

  const oldOrders = await prisma.order.findMany({
    where: { code: { startsWith: 'ORD-' } },
    select: { id: true },
  });
  if (oldOrders.length > 0) {
    const oldIds = oldOrders.map((order) => order.id);
    await prisma.orderItem.deleteMany({ where: { orderId: { in: oldIds } } });
    await prisma.orderStatusHistory.deleteMany({
      where: { orderId: { in: oldIds } },
    });
    await prisma.order.deleteMany({ where: { id: { in: oldIds } } });
  }

  const activeShops = [
    'kopi-nusantara-lestari',
    'batik-sekar-wangi',
    'keripik-tempe-mbok-nem',
  ];
  const customers = await prisma.user.findMany({
    where: { role: UserRole.CUSTOMER },
    orderBy: { email: 'asc' },
  });

  for (let index = 1; index <= 30; index += 1) {
    const shopSlug = activeShops[(index - 1) % activeShops.length];
    const shop = shops[shopSlug]?.shop;
    if (!shop || customers.length === 0) continue;

    const shopProducts = productsByShop[shopSlug] ?? [];
    const customer = customers[(index - 1) % customers.length];
    const status = orderStatusPattern[(index - 1) % orderStatusPattern.length];
    const createdAt = daysAgo(index % 14, 8 + (index % 10), (index * 13) % 60);
    const code = `#ORD-${String(index).padStart(4, '0')}`;

    const itemCount = 1 + (index % Math.min(3, shopProducts.length));
    const picked = Array.from({ length: itemCount }, (_, offset) => {
      return shopProducts[(index + offset) % shopProducts.length];
    }).filter(
      (product, offset, list) =>
        list.findIndex((item) => item.id === product.id) === offset,
    );

    const items = picked.map((product, offset) => ({
      productName: product.name,
      quantity: 1 + ((index + offset) % 3),
      unitPrice: product.price,
    }));
    const total = items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    const existingOrder = await prisma.order.findUnique({ where: { code } });
    if (existingOrder) {
      await prisma.orderItem.deleteMany({
        where: { orderId: existingOrder.id },
      });
      await prisma.orderStatusHistory.deleteMany({
        where: { orderId: existingOrder.id },
      });
    }

    const order = await prisma.order.upsert({
      where: { code },
      update: {
        shopId: shop.id,
        customerId: customer.id,
        total,
        status,
        createdAt,
      },
      create: {
        code,
        shopId: shop.id,
        customerId: customer.id,
        total,
        status,
        createdAt,
      },
    });

    if (items.length > 0) {
      await prisma.orderItem.createMany({
        data: items.map((item) => ({ orderId: order.id, ...item })),
      });
    }

    const histories: {
      fromStatus: OrderStatus | null;
      toStatus: OrderStatus;
      note: string;
      createdAt: Date;
    }[] = [
      {
        fromStatus: null,
        toStatus: OrderStatus.pending,
        note: 'Pesanan dibuat oleh pelanggan.',
        createdAt,
      },
    ];

    if (status === OrderStatus.dibatalkan) {
      histories.push({
        fromStatus: OrderStatus.pending,
        toStatus: OrderStatus.dibatalkan,
        note: 'Pesanan dibatalkan sebelum diproses oleh toko.',
        createdAt: addMinutes(createdAt, 35),
      });
    } else if (status === OrderStatus.diproses || status === OrderStatus.selesai) {
      histories.push({
        fromStatus: OrderStatus.pending,
        toStatus: OrderStatus.diproses,
        note: 'Pesanan dikonfirmasi dan mulai diproses oleh toko.',
        createdAt: addMinutes(createdAt, 30),
      });
      if (status === OrderStatus.selesai) {
        histories.push({
          fromStatus: OrderStatus.diproses,
          toStatus: OrderStatus.selesai,
          note: 'Pesanan selesai dan diterima pelanggan.',
          createdAt: addMinutes(createdAt, 120),
        });
      }
    }

    await prisma.orderStatusHistory.createMany({
      data: histories.map((history) => ({
        orderId: order.id,
        ...history,
      })),
    });
  }

  const now = new Date();
  const monthKey = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const payoutDefs = [
    {
      seq: '094',
      shop: 'kopi-nusantara-lestari',
      bank: 'Bank BCA',
      account: '8045-9812-90',
      method: 'BI-FAST',
      netAmount: 1_845_000,
      commission: 18_650,
      status: PayoutStatus.menunggu,
      daysAgo: 0,
    },
    {
      seq: '093',
      shop: 'batik-sekar-wangi',
      bank: 'Bank Mandiri',
      account: '1370-0199-2810',
      method: 'Realtime RTGS',
      netAmount: 4_210_000,
      commission: 42_500,
      status: PayoutStatus.menunggu,
      daysAgo: 0,
    },
    {
      seq: '092',
      shop: 'keripik-tempe-mbok-nem',
      bank: 'Bank BRI',
      account: '0206-0105-9921',
      method: 'BI-FAST',
      netAmount: 980_000,
      commission: 9_900,
      status: PayoutStatus.berhasil,
      daysAgo: 1,
    },
    {
      seq: '091',
      shop: 'batik-sekar-wangi',
      bank: 'Bank BNI',
      account: '0941-2098-44',
      method: 'Kliring SKN',
      netAmount: 6_450_000,
      commission: 129_000,
      status: PayoutStatus.diverifikasi,
      daysAgo: 1,
    },
    {
      seq: '090',
      shop: 'kopi-nusantara-lestari',
      bank: 'BS Syariah',
      account: '7120-4491-02',
      method: 'BI-FAST',
      netAmount: 1_155_000,
      commission: 11_660,
      status: PayoutStatus.terkirim,
      daysAgo: 1,
    },
    {
      seq: '089',
      shop: 'keripik-tempe-mbok-nem',
      bank: 'Bank Mandiri',
      account: '1370-2114-8890',
      method: 'Realtime RTGS',
      netAmount: 2_760_000,
      commission: 27_600,
      status: PayoutStatus.menunggu,
      daysAgo: 2,
    },
    {
      seq: '088',
      shop: 'kopi-nusantara-lestari',
      bank: 'Bank BCA',
      account: '8045-1120-77',
      method: 'BI-FAST',
      netAmount: 3_320_000,
      commission: 33_200,
      status: PayoutStatus.diverifikasi,
      daysAgo: 2,
    },
    {
      seq: '087',
      shop: 'batik-sekar-wangi',
      bank: 'Bank BRI',
      account: '0206-0112-8834',
      method: 'BI-FAST',
      netAmount: 5_890_000,
      commission: 58_900,
      status: PayoutStatus.berhasil,
      daysAgo: 3,
    },
    {
      seq: '086',
      shop: 'keripik-tempe-mbok-nem',
      bank: 'Bank BNI',
      account: '0941-2280-15',
      method: 'Kliring SKN',
      netAmount: 740_000,
      commission: 7_400,
      status: PayoutStatus.terkirim,
      daysAgo: 3,
    },
    {
      seq: '085',
      shop: 'kopi-nusantara-lestari',
      bank: 'BS Syariah',
      account: '7120-5581-90',
      method: 'BI-FAST',
      netAmount: 2_180_000,
      commission: 21_800,
      status: PayoutStatus.menunggu,
      daysAgo: 4,
    },
  ];

  for (const payout of payoutDefs) {
    const shop = shops[payout.shop]?.shop;
    if (!shop) continue;
    const id = `#PAY-${monthKey}-${payout.seq}`;
    const submittedAt = daysAgo(payout.daysAgo, 8, 30);
    const settled =
      payout.status === PayoutStatus.berhasil ||
      payout.status === PayoutStatus.terkirim;
    const data = {
      shopId: shop.id,
      bank: payout.bank,
      account: payout.account,
      method: payout.method,
      netAmount: payout.netAmount,
      commission: payout.commission,
      status: payout.status,
      submittedAt,
      processedAt: settled ? addMinutes(submittedAt, 240) : null,
      processedById: settled ? admin.id : null,
    };
    await prisma.payout.upsert({
      where: { id },
      update: data,
      create: { id, ...data },
    });
  }

  for (const category of Object.values(categories)) {
    const existingLog = await prisma.adminLog.count({
      where: { targetType: 'CATEGORY', targetId: category.id },
    });
    if (existingLog === 0) {
      await prisma.adminLog.create({
        data: {
          adminId: admin.id,
          action: AdminAction.CREATE_CATEGORY,
          targetType: 'CATEGORY',
          targetId: category.id,
          createdAt: category.createdAt,
        },
      });
    }
  }

  for (const def of ownerDefs) {
    const shop = shops[def.slug]?.shop;
    if (!shop) continue;
    const existingLog = await prisma.adminLog.count({
      where: { targetType: 'SHOP', targetId: shop.id },
    });
    if (existingLog > 0) continue;

    const logs: {
      action: AdminAction;
      reason: string | null;
      createdAt: Date;
    }[] = [];

    if (def.status === ShopStatus.aktif) {
      logs.push({
        action: AdminAction.APPROVE_SHOP,
        reason: null,
        createdAt: addMinutes(def.createdAt, 60 * 24),
      });
    } else if (def.status === ShopStatus.ditolak) {
      logs.push({
        action: AdminAction.REJECT_SHOP,
        reason: def.statusReason,
        createdAt: addMinutes(def.createdAt, 60 * 24),
      });
    } else if (def.status === ShopStatus.nonaktif) {
      logs.push(
        {
          action: AdminAction.APPROVE_SHOP,
          reason: null,
          createdAt: addMinutes(def.createdAt, 60 * 24),
        },
        {
          action: AdminAction.DEACTIVATE_SHOP,
          reason: def.statusReason,
          createdAt: addMinutes(def.createdAt, 60 * 24 * 10),
        },
      );
    }

    if (logs.length > 0) {
      await prisma.adminLog.createMany({
        data: logs.map((log) => ({
          adminId: admin.id,
          targetType: 'SHOP',
          targetId: shop.id,
          ...log,
        })),
      });
    }
  }

  const loginLog = await prisma.adminLog.count({
    where: { action: AdminAction.LOGIN },
  });
  if (loginLog === 0) {
    await prisma.adminLog.create({
      data: {
        adminId: admin.id,
        action: AdminAction.LOGIN,
        targetType: 'USER',
        targetId: admin.id,
        createdAt: addMinutes(now, -45),
      },
    });
  }

  console.log('Seed selesai:', { admin: adminEmail });
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
