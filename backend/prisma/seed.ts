import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting comprehensive database seed for Textile & Retail POS...');

  // 1. Clean existing records in correct relation order
  await prisma.return.deleteMany({});
  await prisma.saleItem.deleteMany({});
  await prisma.sale.deleteMany({});
  await prisma.ledgerEntry.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.supplier.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🧹 Cleaned existing tables.');

  // 2. Create Users
  const adminPasswordHash = await bcrypt.hash('Admin@123', 10);
  const staffPasswordHash = await bcrypt.hash('Staff@123', 10);
  const cashierPasswordHash = await bcrypt.hash('Cashier@123', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Rajesh Sharma',
      email: 'admin@posdemo.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN',
      phone: '+91 98765 43210',
      status: 'ACTIVE',
    },
  });

  const staff = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'staff@posdemo.com',
      passwordHash: staffPasswordHash,
      role: 'STAFF',
      phone: '+91 98123 45678',
      status: 'ACTIVE',
    },
  });

  const cashier = await prisma.user.create({
    data: {
      name: 'Amit Kumar',
      email: 'cashier@posdemo.com',
      passwordHash: cashierPasswordHash,
      role: 'STAFF',
      phone: '+91 98456 78901',
      status: 'ACTIVE',
    },
  });

  console.log('👤 Created Users (Admin, Staff, Cashier).');

  // 3. Create Categories
  const catMensFormal = await prisma.category.create({
    data: { name: "Men's Formal & Shirts", description: "Formal dress shirts, Oxford weaves, and business attire" },
  });

  const catDenimCasual = await prisma.category.create({
    data: { name: "Denim & Casual Bottoms", description: "Selvedge denim, stretch jeans, and tailored chinos" },
  });

  const catWomensEthnic = await prisma.category.create({
    data: { name: "Women's Ethnic & Sarees", description: "Kanchipuram silk, Banarasi brocades, and designer suits" },
  });

  const catTraditional = await prisma.category.create({
    data: { name: "Traditional & Handloom", description: "Khadi kurtas, kurta pajama sets, and handspun fabrics" },
  });

  const catOuterwear = await prisma.category.create({
    data: { name: "Outerwear & Tailoring", description: "Wool blend blazers, Nehru bandhgalas, and winter shawls" },
  });

  const catAccessories = await prisma.category.create({
    data: { name: "Accessories & Essentials", description: "Silk pocket squares, dupattas, and handkerchief sets" },
  });

  console.log('🏷️ Created 6 textile product categories.');

  // 4. Create Suppliers
  const supSurat = await prisma.supplier.create({
    data: {
      name: 'Rameshwar Bhai',
      companyName: 'Surat Weaves & Silk Mills Pvt. Ltd.',
      phone: '+91 98251 09876',
      email: 'sales@suratweaves.in',
      address: 'Plot 42, Ring Road Textile Market, Surat, Gujarat 395002',
      status: 'ACTIVE',
    },
  });

  const supCoimbatore = await prisma.supplier.create({
    data: {
      name: 'S. K. Murugan',
      companyName: 'Coimbatore Cotton & Yarn Co-op',
      phone: '+91 94432 11223',
      email: 'orders@cbecotton.com',
      address: '104 Mill Road, Singanallur, Coimbatore, Tamil Nadu 641005',
      status: 'ACTIVE',
    },
  });

  const supVardhman = await prisma.supplier.create({
    data: {
      name: 'Harpreet Singh',
      companyName: 'Vardhman Textiles Garment Division',
      phone: '+91 98150 44556',
      email: 'h.singh@vardhmantex.com',
      address: 'Chandigarh Road, Focal Point, Ludhiana, Punjab 141010',
      status: 'ACTIVE',
    },
  });

  const supTirupur = await prisma.supplier.create({
    data: {
      name: 'K. Balachandran',
      companyName: 'Tirupur Knitwear Export House',
      phone: '+91 97890 33445',
      email: 'knitwear@tirupurexports.com',
      address: 'Avinashi Road, Kangeyam Cross, Tirupur, Tamil Nadu 641602',
      status: 'ACTIVE',
    },
  });

  const supJaipur = await prisma.supplier.create({
    data: {
      name: 'Manish Rawat',
      companyName: 'Jaipur Handloom Crafts Guild',
      phone: '+91 94140 77889',
      email: 'guild@jaipurhandloom.org',
      address: 'Bapu Bazaar, Johari Gate, Jaipur, Rajasthan 302003',
      status: 'ACTIVE',
    },
  });

  console.log('🏭 Created 5 textile suppliers.');

  // 5. Create Realistic Textile Products
  const productsData = [
    {
      sku: 'M-SHT-COT-01',
      name: 'Premium Egyptian Cotton Formal Shirt',
      categoryId: catMensFormal.id,
      description: '100% Giza Egyptian cotton woven shirt with french cuffs and mother-of-pearl buttons.',
      sellingPrice: 1899,
      costPrice: 950,
      stockQuantity: 45,
      lowStockThreshold: 8,
      unit: 'pcs',
    },
    {
      sku: 'M-SHT-LIN-02',
      name: 'Linen Casual Mandarin Collar Shirt',
      categoryId: catMensFormal.id,
      description: 'Breathable pure Irish linen relaxed-fit casual summer shirt.',
      sellingPrice: 2199,
      costPrice: 1100,
      stockQuantity: 28,
      lowStockThreshold: 5,
      unit: 'pcs',
    },
    {
      sku: 'M-SHT-OXF-03',
      name: 'Royal Oxford Button-Down Shirt',
      categoryId: catMensFormal.id,
      description: 'Classic heavy Oxford cloth weave in sky blue, durable collar construction.',
      sellingPrice: 1699,
      costPrice: 800,
      stockQuantity: 35,
      lowStockThreshold: 6,
      unit: 'pcs',
    },
    {
      sku: 'M-JNS-STR-01',
      name: 'Slim Fit Stretch Denim Jeans',
      categoryId: catDenimCasual.id,
      description: '12.5 oz indigo washed denim with 2% elastane for flexible movement.',
      sellingPrice: 2499,
      costPrice: 1250,
      stockQuantity: 50,
      lowStockThreshold: 10,
      unit: 'pcs',
    },
    {
      sku: 'M-JNS-RAW-02',
      name: 'Raw Selvedge Heavy Denim',
      categoryId: catDenimCasual.id,
      description: '14.5 oz unwashed Japanese kurabo shuttle-loom selvedge denim.',
      sellingPrice: 3499,
      costPrice: 1800,
      stockQuantity: 14,
      lowStockThreshold: 5,
      unit: 'pcs',
    },
    {
      sku: 'M-TRS-CHK-01',
      name: 'Tailored Khaki Chino Pants',
      categoryId: catDenimCasual.id,
      description: 'Mercerized cotton twill chinos with clean front pleats.',
      sellingPrice: 1999,
      costPrice: 950,
      stockQuantity: 24,
      lowStockThreshold: 5,
      unit: 'pcs',
    },
    {
      sku: 'M-TRS-WOL-02',
      name: 'Charcoal Wool Blend Trousers',
      categoryId: catDenimCasual.id,
      description: 'Poly-wool crease-resistant formal business trousers.',
      sellingPrice: 2299,
      costPrice: 1150,
      stockQuantity: 18,
      lowStockThreshold: 4,
      unit: 'pcs',
    },
    {
      sku: 'M-TEE-PIM-01',
      name: 'Pima Cotton Crewneck T-Shirt',
      categoryId: catDenimCasual.id,
      description: 'Silky smooth combed Pima cotton regular tee in deep navy.',
      sellingPrice: 799,
      costPrice: 350,
      stockQuantity: 65,
      lowStockThreshold: 12,
      unit: 'pcs',
    },
    {
      sku: 'M-POL-PIQ-01',
      name: 'Classic Pique Cotton Polo',
      categoryId: catDenimCasual.id,
      description: 'Woven ribbed collar polo shirt with contrast tipping.',
      sellingPrice: 1299,
      costPrice: 600,
      stockQuantity: 4, // LOW STOCK ALERT
      lowStockThreshold: 8,
      unit: 'pcs',
    },
    {
      sku: 'W-SAR-KAN-01',
      name: 'Pure Kanchipuram Silk Saree',
      categoryId: catWomensEthnic.id,
      description: 'Handwoven mulberry silk saree with pure zari korvai border.',
      sellingPrice: 12999,
      costPrice: 7500,
      stockQuantity: 8,
      lowStockThreshold: 3,
      unit: 'pcs',
    },
    {
      sku: 'W-SAR-BAN-02',
      name: 'Banarasi Brocade Bridal Saree',
      categoryId: catWomensEthnic.id,
      description: 'Opulent crimson Banarasi silk saree with floral kadwa motifs.',
      sellingPrice: 15499,
      costPrice: 8800,
      stockQuantity: 6,
      lowStockThreshold: 2,
      unit: 'pcs',
    },
    {
      sku: 'W-SAR-CHN-03',
      name: 'Handblock Chanderi Cotton Saree',
      categoryId: catWomensEthnic.id,
      description: 'Lightweight sheer silk-cotton blend with gold tissue border.',
      sellingPrice: 4599,
      costPrice: 2400,
      stockQuantity: 15,
      lowStockThreshold: 4,
      unit: 'pcs',
    },
    {
      sku: 'W-ST-ARK-01',
      name: 'Georgette Embroidered Anarkali Suit',
      categoryId: catWomensEthnic.id,
      description: 'Floor-length flared Anarkali set with intricate Lucknowi chikankari.',
      sellingPrice: 5999,
      costPrice: 3200,
      stockQuantity: 12,
      lowStockThreshold: 3,
      unit: 'pcs',
    },
    {
      sku: 'W-KRT-COT-01',
      name: 'Embroidered Cotton Daily Kurti',
      categoryId: catWomensEthnic.id,
      description: 'Soft pure cotton everyday kurti with subtle floral threadwork.',
      sellingPrice: 1199,
      costPrice: 550,
      stockQuantity: 32,
      lowStockThreshold: 6,
      unit: 'pcs',
    },
    {
      sku: 'M-KRT-KHD-01',
      name: 'Handloom Khadi Kurta for Men',
      categoryId: catTraditional.id,
      description: 'Authentic handspun unbleached khadi cotton kurta with side pockets.',
      sellingPrice: 1599,
      costPrice: 750,
      stockQuantity: 3, // LOW STOCK ALERT
      lowStockThreshold: 5,
      unit: 'pcs',
    },
    {
      sku: 'M-SET-SLK-01',
      name: 'Silk Blend Kurta Churidar Set',
      categoryId: catTraditional.id,
      description: 'Tussar silk blend royal kurta set with jacquard ethnic jacket.',
      sellingPrice: 3999,
      costPrice: 2100,
      stockQuantity: 10,
      lowStockThreshold: 3,
      unit: 'set',
    },
    {
      sku: 'U-SHW-PSH-01',
      name: 'Handwoven Kashmiri Pashmina Shawl',
      categoryId: catOuterwear.id,
      description: 'Ultra-soft pure Changthangi cashmere goat wool shawl with sozni embroidery.',
      sellingPrice: 6999,
      costPrice: 3800,
      stockQuantity: 7,
      lowStockThreshold: 2,
      unit: 'pcs',
    },
    {
      sku: 'M-BLZ-WOL-01',
      name: 'Tailored Wool Blend Blazer',
      categoryId: catOuterwear.id,
      description: 'Double-vented structured blazer in subtle prince-of-wales check.',
      sellingPrice: 6499,
      costPrice: 3400,
      stockQuantity: 9,
      lowStockThreshold: 3,
      unit: 'pcs',
    },
    {
      sku: 'M-JKT-NEH-01',
      name: 'Pure Linen Nehru Bandhgala Vest',
      categoryId: catOuterwear.id,
      description: 'Tailored sleeveless Nehru jacket in rustic sand linen.',
      sellingPrice: 3499,
      costPrice: 1800,
      stockQuantity: 0, // OUT OF STOCK ALERT
      lowStockThreshold: 4,
      unit: 'pcs',
    },
    {
      sku: 'A-PCK-SLK-01',
      name: 'Mulberry Silk Printed Pocket Square',
      categoryId: catAccessories.id,
      description: 'Hand-rolled hem 100% twill silk handkerchief for blazer pockets.',
      sellingPrice: 499,
      costPrice: 180,
      stockQuantity: 40,
      lowStockThreshold: 10,
      unit: 'pcs',
    },
    {
      sku: 'A-HNK-SET-01',
      name: 'Egyptian Cotton Handkerchief Set (3-Pack)',
      categoryId: catAccessories.id,
      description: 'Satin-weave pure white monogram-ready formal pocket kerchiefs.',
      sellingPrice: 399,
      costPrice: 140,
      stockQuantity: 55,
      lowStockThreshold: 10,
      unit: 'set',
    },
    {
      sku: 'W-DUP-SLK-01',
      name: 'Banarasi Zari Border Silk Dupatta',
      categoryId: catAccessories.id,
      description: 'Vibrant scarlet red festive dupatta with dense floral golden zari.',
      sellingPrice: 1499,
      costPrice: 700,
      stockQuantity: 22,
      lowStockThreshold: 5,
      unit: 'pcs',
    },
  ];

  const createdProducts = [];
  for (const p of productsData) {
    const prod = await prisma.product.create({
      data: {
        ...p,
        status: 'ACTIVE',
      },
    });
    createdProducts.push(prod);
  }

  console.log(`👕 Created ${createdProducts.length} realistic textile products.`);

  // 6. Seed Opening Capital Ledger Entry
  let runningBalance = 350000; // Starting store bank capital
  await prisma.ledgerEntry.create({
    data: {
      type: 'OPENING_BALANCE',
      reference: 'CAP-2026-001',
      description: 'Store Opening Operating Capital & Reserve Fund',
      credit: 350000,
      debit: 0,
      balance: runningBalance,
      date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      createdById: admin.id,
    },
  });

  // Supplier invoice payment
  runningBalance -= 75000;
  await prisma.ledgerEntry.create({
    data: {
      type: 'SUPPLIER_PAYMENT',
      reference: 'PO-SW-8812',
      description: 'Inventory bulk purchase advance paid to Surat Weaves & Silk Mills',
      credit: 0,
      debit: 75000,
      balance: runningBalance,
      date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
      createdById: admin.id,
    },
  });

  // Store utility expense
  runningBalance -= 18500;
  await prisma.ledgerEntry.create({
    data: {
      type: 'EXPENSE',
      reference: 'EXP-ELEC-FEB',
      description: 'Showroom electricity & air conditioning utility bill',
      credit: 0,
      debit: 18500,
      balance: runningBalance,
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      createdById: admin.id,
    },
  });

  // 7. Seed Realistic Historical Sales & SaleItems
  const historicalSales = [
    {
      daysAgo: 5,
      staffId: staff.id,
      customerName: 'Vikram Malhotra',
      customerPhone: '+91 98200 11223',
      paymentMethod: 'CARD',
      discount: 200,
      items: [
        { productIndex: 0, qty: 2 }, // Cotton Shirt (1899 * 2 = 3798)
        { productIndex: 3, qty: 1 }, // Denim Jeans (2499)
        { productIndex: 19, qty: 1 }, // Pocket Square (499)
      ],
    },
    {
      daysAgo: 4,
      staffId: cashier.id,
      customerName: 'Ananya Deshmukh',
      customerPhone: '+91 98400 33445',
      paymentMethod: 'UPI',
      discount: 500,
      items: [
        { productIndex: 9, qty: 1 }, // Kanchipuram Silk Saree (12999)
        { productIndex: 21, qty: 1 }, // Dupatta (1499)
      ],
    },
    {
      daysAgo: 3,
      staffId: staff.id,
      customerName: 'Rohit Verma',
      customerPhone: '+91 98311 55667',
      paymentMethod: 'CASH',
      discount: 0,
      amountReceived: 5000,
      items: [
        { productIndex: 1, qty: 1 }, // Linen Shirt (2199)
        { productIndex: 5, qty: 1 }, // Chino (1999)
        { productIndex: 20, qty: 1 }, // Handkerchief (399)
      ],
    },
    {
      daysAgo: 2,
      staffId: cashier.id,
      customerName: 'Meenakshi Sundaram',
      customerPhone: '+91 94440 99887',
      paymentMethod: 'CARD',
      discount: 800,
      items: [
        { productIndex: 10, qty: 1 }, // Banarasi Saree (15499)
        { productIndex: 12, qty: 1 }, // Anarkali (5999)
      ],
    },
    {
      daysAgo: 1,
      staffId: staff.id,
      customerName: 'Gaurav Singhania',
      customerPhone: '+91 98110 66778',
      paymentMethod: 'UPI',
      discount: 300,
      items: [
        { productIndex: 17, qty: 1 }, // Blazer (6499)
        { productIndex: 6, qty: 1 }, // Wool Trousers (2299)
        { productIndex: 19, qty: 2 }, // 2x Pocket Square (499 * 2 = 998)
      ],
    },
    {
      daysAgo: 0, // Today's sale
      staffId: staff.id,
      customerName: 'Kavita Chawla',
      customerPhone: '+91 98230 44556',
      paymentMethod: 'UPI',
      discount: 150,
      items: [
        { productIndex: 11, qty: 1 }, // Chanderi Saree (4599)
        { productIndex: 13, qty: 2 }, // 2x Daily Kurti (1199 * 2 = 2398)
      ],
    },
    {
      daysAgo: 0, // Today's sale
      staffId: cashier.id,
      customerName: 'Arjun Nambiar',
      customerPhone: '+91 98470 22334',
      paymentMethod: 'CASH',
      discount: 100,
      amountReceived: 3000,
      items: [
        { productIndex: 7, qty: 2 }, // 2x Pima Tee (799 * 2 = 1598)
        { productIndex: 8, qty: 1 }, // Polo (1299)
      ],
    },
    {
      daysAgo: 0, // Today's sale
      staffId: staff.id,
      customerName: 'Deepak Saxena',
      customerPhone: '+91 98990 77881',
      paymentMethod: 'CARD',
      discount: 0,
      items: [
        { productIndex: 15, qty: 1 }, // Silk Kurta Churidar (3999)
        { productIndex: 14, qty: 1 }, // Khadi Kurta (1599)
      ],
    },
  ];

  let invoiceCounter = 1001;
  const createdSales = [];

  for (const s of historicalSales) {
    const saleDate = new Date();
    saleDate.setDate(saleDate.getDate() - s.daysAgo);
    saleDate.setHours(10 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60));

    let subtotal = 0;
    const itemsData = s.items.map((it) => {
      const prod = createdProducts[it.productIndex];
      const lineTotal = prod.sellingPrice * it.qty;
      subtotal += lineTotal;
      return {
        productId: prod.id,
        quantity: it.qty,
        unitPrice: prod.sellingPrice,
        costPrice: prod.costPrice,
        total: lineTotal,
      };
    });

    const taxableAmount = Math.max(0, subtotal - s.discount);
    const tax = Math.round(taxableAmount * 0.05 * 100) / 100; // 5% GST
    const total = Math.round((taxableAmount + tax) * 100) / 100;
    const invNum = `INV-2026-${invoiceCounter++}`;

    const sale = await prisma.sale.create({
      data: {
        invoiceNumber: invNum,
        staffId: s.staffId,
        customerName: s.customerName,
        customerPhone: s.customerPhone,
        subtotal,
        discount: s.discount,
        tax,
        total,
        paymentMethod: s.paymentMethod,
        paymentStatus: 'PAID',
        amountReceived: s.amountReceived || total,
        changeGiven: s.amountReceived ? s.amountReceived - total : 0,
        createdAt: saleDate,
        updatedAt: saleDate,
        items: {
          create: itemsData,
        },
      },
      include: { items: true },
    });

    // Ledger entry for sale
    runningBalance += total;
    await prisma.ledgerEntry.create({
      data: {
        type: 'SALE',
        reference: invNum,
        description: `Retail POS Sale: ${invNum} (${s.paymentMethod}) - ${s.customerName}`,
        credit: total,
        debit: 0,
        balance: runningBalance,
        date: saleDate,
        createdById: s.staffId,
      },
    });

    createdSales.push(sale);
  }

  console.log(`🧾 Created ${createdSales.length} historical retail transactions & ledger entries.`);

  // 8. Seed a Realistic Product Return
  // Customer Vikram Malhotra returned 1 of the 2 Cotton Shirts from sale #0
  const firstSale = createdSales[0];
  const cottonShirtItem = firstSale.items[0]; // Cotton Shirt
  const refundAmount = cottonShirtItem.unitPrice; // 1899

  await prisma.return.create({
    data: {
      saleId: firstSale.id,
      productId: cottonShirtItem.productId,
      quantity: 1,
      reason: 'Size exchange requested - collar size smaller than expected',
      refundAmount,
      processedById: staff.id,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    },
  });

  // Update saleItem returnedQuantity and sale status
  await prisma.saleItem.update({
    where: { id: cottonShirtItem.id },
    data: { returnedQuantity: 1 },
  });

  await prisma.sale.update({
    where: { id: firstSale.id },
    data: { paymentStatus: 'PARTIALLY_REFUNDED' },
  });

  // Ledger entry for return refund
  runningBalance -= refundAmount;
  await prisma.ledgerEntry.create({
    data: {
      type: 'RETURN',
      reference: firstSale.invoiceNumber,
      description: `Customer Return Refund: Premium Egyptian Cotton Formal Shirt (Qty: 1) - ${firstSale.invoiceNumber}`,
      credit: 0,
      debit: refundAmount,
      balance: runningBalance,
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      createdById: staff.id,
    },
  });

  console.log('🔄 Created demo return record & refund ledger entry.');
  console.log('🎉 Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during database seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
