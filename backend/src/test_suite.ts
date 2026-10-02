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

async function runTestSuite() {
  console.log('====================================================');
  console.log('🚀 STARTING COMPREHENSIVE END-TO-END VALIDATION TEST');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}${detail ? ` -> ${detail}` : ''}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // 1. BACKEND & HEALTH CHECK
    // ----------------------------------------------------
    console.log('\n--- 1. Backend & Health Telemetry ---');
    const healthRes = await request('/health');
    assert(healthRes.status === 200, 'Health endpoint responds with HTTP 200');
    assert(healthRes.data?.status === 'healthy', 'Health status is "healthy"');

    // ----------------------------------------------------
    // 2. AUTHENTICATION & ACCESS CONTROL
    // ----------------------------------------------------
    console.log('\n--- 2. Authentication & Role-Based Access Control ---');

    // 2a. Admin Login
    const adminLoginRes = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@posdemo.com',
        password: 'Admin@123',
      },
    });
    assert(adminLoginRes.data?.success === true, 'Admin login succeeded');
    assert(adminLoginRes.data?.user?.role === 'ADMIN', 'Admin user role is ADMIN');
    const adminToken = adminLoginRes.data?.token;

    // 2b. Staff Login
    const staffLoginRes = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'staff@posdemo.com',
        password: 'Staff@123',
      },
    });
    assert(staffLoginRes.data?.success === true, 'Staff login succeeded');
    assert(staffLoginRes.data?.user?.role === 'STAFF', 'Staff user role is STAFF');
    const staffToken = staffLoginRes.data?.token;

    // 2c. Invalid Credentials Rejection
    const invalidLoginRes = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'admin@posdemo.com',
        password: 'WrongPassword999',
      },
    });
    assert(invalidLoginRes.status === 401, 'Invalid credentials rejected with HTTP 401');

    // 2d. Protected Route Without Token
    const unauthRes = await request('/products');
    assert(unauthRes.status === 401, 'Unauthenticated request rejected with HTTP 401');

    // 2e. Staff Access Restriction to Admin-Only Route
    const staffForbiddenRes = await request('/staff', {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(staffForbiddenRes.status === 403, 'Staff access to /api/staff restricted with HTTP 403');

    // ----------------------------------------------------
    // 3. ADMIN PORTAL CRUD & RELATIONAL PERSISTENCE
    // ----------------------------------------------------
    console.log('\n--- 3. Admin Portal CRUD Operations & Persistence ---');

    // 3a. Category CRUD
    const catName = `Validation Fabrics ${Date.now()}`;
    const createCatRes = await request('/categories', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { name: catName, description: 'Test category for validation suite' },
    });
    assert(createCatRes.status === 201, 'Created new Category');
    const testCatId = createCatRes.data?.category?.id;

    // Update category
    const updateCatRes = await request(`/categories/${testCatId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { name: `${catName} Updated`, description: 'Updated description' },
    });
    assert(updateCatRes.data?.category?.name === `${catName} Updated`, 'Updated Category persisted');

    // 3b. Product CRUD
    const testSku = `VAL-SHIRT-${Date.now().toString().slice(-4)}`;
    const createProdRes = await request('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        sku: testSku,
        name: 'Validation Silk Oxford Shirt',
        categoryId: testCatId,
        description: 'Silk Oxford weave shirt for automated validation',
        sellingPrice: 2000,
        costPrice: 1000,
        stockQuantity: 20,
        lowStockThreshold: 5,
        unit: 'pcs',
        status: 'ACTIVE',
      },
    });
    assert(createProdRes.status === 201, 'Created new Textile Product');
    const testProdId = createProdRes.data?.product?.id;

    // Verify negative price rejected
    const negPriceRes = await request('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        sku: `VAL-NEG-${Date.now().toString().slice(-4)}`,
        name: 'Negative Price Shirt',
        categoryId: testCatId,
        sellingPrice: -500,
        costPrice: 200,
        stockQuantity: 10,
      },
    });
    assert(negPriceRes.status === 400, 'Negative price rejected with HTTP 400');

    // Verify duplicate SKU rejected
    const dupSkuRes = await request('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        sku: testSku,
        name: 'Duplicate SKU Shirt',
        categoryId: testCatId,
        sellingPrice: 1500,
        costPrice: 700,
        stockQuantity: 10,
      },
    });
    assert(dupSkuRes.status === 409, 'Duplicate SKU rejected with HTTP 409 Conflict');

    // Update product stock
    const updateProdRes = await request(`/products/${testProdId}`, {
      method: 'PUT',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { stockQuantity: 25 },
    });
    assert(updateProdRes.data?.product?.stockQuantity === 25, 'Product stock update persisted to 25');

    // Safe category deletion check (cannot delete category with active products)
    const deleteCatFailRes = await request(`/categories/${testCatId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(deleteCatFailRes.status === 400, 'Prevented deletion of category with assigned products');

    // 3c. Staff Management CRUD
    const newStaffEmail = `staff_${Date.now()}@posdemo.com`;
    const createStaffRes = await request('/staff', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'Validation Cashier',
        email: newStaffEmail,
        password: 'Password@123',
        role: 'STAFF',
        phone: '+91 99999 11111',
      },
    });
    assert(createStaffRes.status === 201, 'Created new Staff member');
    assert(createStaffRes.data?.staff?.passwordHash === undefined, 'Password hash is NOT exposed in response');
    const newStaffId = createStaffRes.data?.staff?.id;

    // Toggle staff status
    const toggleStaffRes = await request(`/staff/${newStaffId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(toggleStaffRes.data?.staff?.status === 'INACTIVE', 'Staff status toggled to INACTIVE');

    // 3d. Supplier CRUD
    const createSupRes = await request('/suppliers', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: 'Kailash Nath',
        companyName: `Kailash Handlooms ${Date.now()}`,
        phone: '+91 98888 22222',
        email: 'kailash@handloom.in',
        address: 'Varanasi Weavers Colony, UP',
      },
    });
    assert(createSupRes.status === 201, 'Created new Supplier record');

    // ----------------------------------------------------
    // 4. BILLING PORTAL & TRANSACTION WORKFLOW
    // ----------------------------------------------------
    console.log('\n--- 4. Billing Portal & Atomic Sales Workflow ---');

    // 4a. Insufficient Stock Scenario Test
    const overStockRes = await request('/pos/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: {
        items: [{ productId: testProdId, quantity: 9999 }], // Exceeds available stock 25
        paymentMethod: 'CASH',
        amountReceived: 2000000,
      },
    });
    assert(overStockRes.status === 400, 'Insufficient stock checkout rejected with HTTP 400');

    // 4b. Real Transaction Execution
    // Buy 2 units of test product (sellingPrice = 2000 each = 4000)
    // Discount = 200 -> Taxable = 3800 -> 5% Tax = 190 -> Total = 3990
    // Amount Received = 5000 -> Change = 1010
    const checkoutRes = await request('/pos/checkout', {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: {
        items: [{ productId: testProdId, quantity: 2 }],
        discount: 200,
        taxRate: 5,
        paymentMethod: 'CASH',
        amountReceived: 5000,
        customerName: 'Aarav Singhania',
        customerPhone: '+91 97777 33333',
        notes: 'Wedding shopping bill',
      },
    });

    assert(checkoutRes.status === 201, 'Checkout completed successfully');
    const completedSale = checkoutRes.data?.sale;
    assert(completedSale?.subtotal === 4000, 'Calculated correct subtotal (₹4,000)');
    assert(completedSale?.discount === 200, 'Applied discount of ₹200');
    assert(completedSale?.tax === 190, 'Applied 5% GST (₹190)');
    assert(completedSale?.total === 3990, 'Grand total is ₹3,990');
    assert(completedSale?.amountReceived === 5000, 'Cash received is ₹5,000');
    assert(completedSale?.changeGiven === 1010, 'Calculated correct change to return (₹1,010)');
    assert(completedSale?.invoiceNumber?.startsWith('INV-'), 'Generated formatted invoice number');

    // 4c. Verify Stock Decremented in Database
    const stockCheckProd = await request(`/products/${testProdId}`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      stockCheckProd.data?.product?.stockQuantity === 23,
      'Product stock atomically decreased from 25 to 23'
    );

    // ----------------------------------------------------
    // 5. PRODUCT RETURNS & STOCK RESTORATION
    // ----------------------------------------------------
    console.log('\n--- 5. Product Returns & Stock Restoration Workflow ---');

    // 5a. Attempt to return more items than purchased (purchased = 2, try to return 5)
    const overReturnRes = await request('/returns', {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: {
        saleId: completedSale.id,
        productId: testProdId,
        quantity: 5,
        reason: 'Excessive return test',
      },
    });
    assert(overReturnRes.status === 400, 'Over-return rejected with HTTP 400');

    // 5b. Valid Return of 1 Unit
    const returnRes = await request('/returns', {
      method: 'POST',
      headers: { Authorization: `Bearer ${staffToken}` },
      body: {
        saleId: completedSale.id,
        productId: testProdId,
        quantity: 1,
        reason: 'Sleeve size slightly long - customer exchange',
      },
    });
    assert(returnRes.status === 201, 'Valid return processed successfully');
    assert(returnRes.data?.returnRecord?.quantity === 1, 'Return quantity recorded as 1');
    assert(returnRes.data?.returnRecord?.refundAmount === 2000, 'Calculated refund amount of ₹2,000');

    // 5c. Verify Stock Restored in Database
    const restoredStockProd = await request(`/products/${testProdId}`, {
      headers: { Authorization: `Bearer ${staffToken}` },
    });
    assert(
      restoredStockProd.data?.product?.stockQuantity === 24,
      'Product stock atomically restored from 23 back to 24'
    );

    // 5d. Verify Transaction Status Updated
    const updatedSaleCheck = await request(`/transactions/${completedSale.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(
      updatedSaleCheck.data?.sale?.paymentStatus === 'PARTIALLY_REFUNDED',
      'Transaction status updated to PARTIALLY_REFUNDED'
    );

    // ----------------------------------------------------
    // 6. REPORTS & GENERAL LEDGER RECONCILIATION
    // ----------------------------------------------------
    console.log('\n--- 6. Reports & General Ledger Audit ---');

    // 6a. Check Ledger
    const ledgerRes = await request('/ledger', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(ledgerRes.status === 200, 'Ledger endpoint responds with HTTP 200');
    const latestEntries = ledgerRes.data?.entries || [];

    console.log('Top 3 Ledger Entries:', latestEntries.slice(0, 3).map((e: any) => ({ type: e.type, ref: e.reference, debit: e.debit, credit: e.credit, date: e.date, createdAt: e.createdAt })));
    const returnEntry = latestEntries.find((e: any) => e.type === 'RETURN' && e.reference === completedSale.invoiceNumber);
    assert(returnEntry !== undefined, 'Customer RETURN entry found in General Ledger');
    assert(returnEntry?.debit === 2000, 'Customer return logged as debit of ₹2,000');

    // Prior entry should be the SALE credit
    const saleEntry = latestEntries.find(
      (e: any) => e.type === 'SALE' && e.reference === completedSale.invoiceNumber
    );
    assert(saleEntry !== undefined, 'Sale invoice entry recorded in General Ledger');
    assert(saleEntry?.credit === 3990, 'Sale recorded as credit of ₹3,990 in General Ledger');

    // 6b. Check Dashboard Stats Telemetry
    const dashboardStatsRes = await request('/reports/dashboard', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(dashboardStatsRes.data?.stats?.totalTransactions >= 1, 'Dashboard counts transaction');
    assert(dashboardStatsRes.data?.stats?.todayRevenue > 0, "Dashboard reflects today's revenue");

    // 6c. Check Sales Report
    const salesReportRes = await request('/reports/sales', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(salesReportRes.data?.summary?.totalRevenue > 0, 'Sales report calculates gross revenue');
    assert(salesReportRes.data?.summary?.totalDiscounts > 0, 'Sales report calculates total discounts');
    assert(salesReportRes.data?.summary?.totalTax > 0, 'Sales report calculates total taxes');

    // 6d. Check Payment Report
    const paymentReportRes = await request('/reports/payments', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(paymentReportRes.data?.paymentBreakdown?.length > 0, 'Payment report contains method breakdown');

    console.log('\n====================================================');
    console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
    console.log('====================================================\n');

    if (failed > 0) {
      process.exit(1);
    }
  } catch (err: any) {
    console.error('💥 Test suite encountered unhandled error:', err.message);
    process.exit(1);
  }
}

runTestSuite();
