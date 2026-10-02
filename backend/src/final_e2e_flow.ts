const BASE_URL = 'http://127.0.0.1:5001/api';

async function request(path: string, options: any = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  const status = response.status;
  let data: any = null;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  return { status, data, ok: response.ok };
}

async function runFinalE2E() {
  console.log('\n=============================================================');
  console.log('🎯 RUNNING FINAL END-TO-END VERIFICATION FLOW (SECTION 10)');
  console.log('=============================================================\n');

  // Step 1: Admin login
  console.log('Step 1: Admin Login...');
  const adminLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'admin@posdemo.com', password: 'Admin@123' },
  });
  if (!adminLogin.data?.success) throw new Error('Admin login failed');
  const adminToken = adminLogin.data.token;
  console.log('  -> Logged in as:', adminLogin.data.user.name, `(${adminLogin.data.user.role})`);

  // Step 2: Create product as Admin
  console.log('\nStep 2: Admin Creates Product...');
  const cats = await request('/categories', { headers: { Authorization: `Bearer ${adminToken}` } });
  const catId = cats.data.categories[0].id;
  const prodSku = `FINAL-KRT-${Date.now().toString().slice(-4)}`;

  const createProd = await request('/products', {
    method: 'POST',
    headers: { Authorization: `Bearer ${adminToken}` },
    body: {
      sku: prodSku,
      name: 'Final Silk Festive Kurta Set',
      categoryId: catId,
      description: 'End-to-end verification garment',
      sellingPrice: 2500,
      costPrice: 1200,
      stockQuantity: 15,
      lowStockThreshold: 4,
      unit: 'set',
      status: 'ACTIVE',
    },
  });
  if (createProd.status !== 201) throw new Error('Product creation failed');
  const createdProd = createProd.data.product;
  console.log('  -> Created Product:', createdProd.name, `[SKU: ${createdProd.sku}]`);
  console.log('  -> Initial Stock:', createdProd.stockQuantity, createdProd.unit);

  // Step 3: Staff login
  console.log('\nStep 3: Staff Login...');
  const staffLogin = await request('/auth/login', {
    method: 'POST',
    body: { email: 'staff@posdemo.com', password: 'Staff@123' },
  });
  if (!staffLogin.data?.success) throw new Error('Staff login failed');
  const staffToken = staffLogin.data.token;
  console.log('  -> Logged in as:', staffLogin.data.user.name, `(${staffLogin.data.user.role})`);

  // Step 4: Sell product as Staff
  console.log('\nStep 4: Staff Sells Product via POS Checkout...');
  // 2 sets * 2500 = 5000 subtotal, 0 discount, 5% tax = 250 -> Total = 5250
  const checkout = await request('/pos/checkout', {
    method: 'POST',
    headers: { Authorization: `Bearer ${staffToken}` },
    body: {
      items: [{ productId: createdProd.id, quantity: 2 }],
      discount: 0,
      taxRate: 5,
      paymentMethod: 'CASH',
      amountReceived: 6000,
      customerName: 'Sanjay Dutt',
      customerPhone: '+91 98111 22222',
      notes: 'Final E2E Sale',
    },
  });
  if (checkout.status !== 201) throw new Error('Checkout failed');
  const sale = checkout.data.sale;
  console.log('  -> Sale Completed! Invoice #:', sale.invoiceNumber);
  console.log('  -> Subtotal: ₹' + sale.subtotal, '| Tax (5%): ₹' + sale.tax, '| Total: ₹' + sale.total);
  console.log('  -> Tendered: ₹' + sale.amountReceived, '| Change Returned: ₹' + sale.changeGiven);

  // Step 5: Verify inventory decreases
  console.log('\nStep 5: Verify Inventory Decreased...');
  const checkStockAfterSale = await request(`/products/${createdProd.id}`, {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  const stockAfterSale = checkStockAfterSale.data.product.stockQuantity;
  console.log(`  -> Stock was 15, is now: ${stockAfterSale} (Expected 13)`);
  if (stockAfterSale !== 13) throw new Error(`Stock mismatch: expected 13, got ${stockAfterSale}`);

  // Step 6: Verify invoice generated
  console.log('\nStep 6: Verify Invoice Data Integrity...');
  if (!sale.invoiceNumber || !sale.items?.length) throw new Error('Invoice data missing');
  console.log('  -> Verified Invoice Format:', sale.invoiceNumber, `with ${sale.items.length} line items`);

  // Step 7: Admin views transaction
  console.log('\nStep 7: Admin Inspects Transaction Record...');
  const viewSale = await request(`/transactions/${sale.id}`, {
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  if (viewSale.status !== 200) throw new Error('Admin view sale failed');
  console.log('  -> Retrieved Sale:', viewSale.data.sale.invoiceNumber, '| Status:', viewSale.data.sale.paymentStatus);

  // Step 8: Return product
  console.log('\nStep 8: Process Product Return (1 Unit)...');
  const processReturn = await request('/returns', {
    method: 'POST',
    headers: { Authorization: `Bearer ${staffToken}` },
    body: {
      saleId: sale.id,
      productId: createdProd.id,
      quantity: 1,
      reason: 'Customer requested size exchange',
    },
  });
  if (processReturn.status !== 201) throw new Error('Return failed');
  const retRecord = processReturn.data.returnRecord;
  console.log('  -> Processed Return of', retRecord.quantity, 'unit(s) | Refund Amount: ₹' + retRecord.refundAmount);

  // Step 9: Verify inventory restored
  console.log('\nStep 9: Verify Inventory Restored...');
  const checkStockAfterReturn = await request(`/products/${createdProd.id}`, {
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  const stockAfterReturn = checkStockAfterReturn.data.product.stockQuantity;
  console.log(`  -> Stock was 13, is now: ${stockAfterReturn} (Expected 14)`);
  if (stockAfterReturn !== 14) throw new Error(`Stock mismatch: expected 14, got ${stockAfterReturn}`);

  // Step 10: Verify reports/ledger updated
  console.log('\nStep 10: Verify General Ledger & Business Reports Updated...');
  const ledger = await request('/ledger', { headers: { Authorization: `Bearer ${adminToken}` } });
  const entries = ledger.data.entries;
  const saleLedgerEntry = entries.find((e: any) => e.type === 'SALE' && e.reference === sale.invoiceNumber);
  const returnLedgerEntry = entries.find((e: any) => e.type === 'RETURN' && e.reference === sale.invoiceNumber);

  if (!saleLedgerEntry) throw new Error('Sale ledger entry missing');
  if (!returnLedgerEntry) throw new Error('Return ledger entry missing');

  console.log('  -> Found Sale Ledger Entry: Credit +₹' + saleLedgerEntry.credit, `[Ref: ${saleLedgerEntry.reference}]`);
  console.log('  -> Found Return Ledger Entry: Debit -₹' + returnLedgerEntry.debit, `[Ref: ${returnLedgerEntry.reference}]`);
  console.log('  -> Current Showroom Balance: ₹' + ledger.data.currentBalance);

  const dashStats = await request('/reports/dashboard', { headers: { Authorization: `Bearer ${adminToken}` } });
  console.log('  -> Dashboard Today Revenue: ₹' + dashStats.data.stats.todayRevenue);

  console.log('\n=============================================================');
  console.log('🎉 SECTION 10 END-TO-END FLOW COMPLETED WITH 100% SUCCESS!');
  console.log('=============================================================\n');
}

runFinalE2E().catch((err) => {
  console.error('💥 E2E Flow Failed:', err);
  process.exit(1);
});
