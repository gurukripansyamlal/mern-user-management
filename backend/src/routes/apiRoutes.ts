import { Router } from 'express';
import { authenticate, requireAdmin, requireStaffOrAdmin } from '../middleware/authMiddleware';
import * as authCtrl from '../controllers/authController';
import * as productCtrl from '../controllers/productController';
import * as categoryCtrl from '../controllers/categoryController';
import * as posCtrl from '../controllers/posController';
import * as transactionCtrl from '../controllers/transactionController';
import * as returnCtrl from '../controllers/returnController';
import * as staffCtrl from '../controllers/staffController';
import * as supplierCtrl from '../controllers/supplierController';
import * as ledgerCtrl from '../controllers/ledgerController';
import * as reportCtrl from '../controllers/reportController';

const router = Router();

// --- Auth Routes ---
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', authenticate, authCtrl.getMe);
router.put('/auth/profile', authenticate, authCtrl.updateProfile);

// --- Product Routes ---
router.get('/products', authenticate, productCtrl.getProducts);
router.get('/products/:id', authenticate, productCtrl.getProductById);
router.post('/products', authenticate, requireAdmin, productCtrl.createProduct);
router.put('/products/:id', authenticate, requireAdmin, productCtrl.updateProduct);
router.delete('/products/:id', authenticate, requireAdmin, productCtrl.deleteProduct);

// --- Category Routes ---
router.get('/categories', authenticate, categoryCtrl.getCategories);
router.post('/categories', authenticate, requireAdmin, categoryCtrl.createCategory);
router.put('/categories/:id', authenticate, requireAdmin, categoryCtrl.updateCategory);
router.delete('/categories/:id', authenticate, requireAdmin, categoryCtrl.deleteCategory);

// --- Staff Management Routes (Admin Only) ---
router.get('/staff', authenticate, requireAdmin, staffCtrl.getStaffList);
router.post('/staff', authenticate, requireAdmin, staffCtrl.createStaff);
router.put('/staff/:id', authenticate, requireAdmin, staffCtrl.updateStaff);
router.patch('/staff/:id/password', authenticate, requireAdmin, staffCtrl.resetStaffPassword);
router.patch('/staff/:id/status', authenticate, requireAdmin, staffCtrl.toggleStaffStatus);

// --- Supplier Routes (Admin Only) ---
router.get('/suppliers', authenticate, requireAdmin, supplierCtrl.getSuppliers);
router.get('/suppliers/:id', authenticate, requireAdmin, supplierCtrl.getSupplierById);
router.post('/suppliers', authenticate, requireAdmin, supplierCtrl.createSupplier);
router.put('/suppliers/:id', authenticate, requireAdmin, supplierCtrl.updateSupplier);
router.delete('/suppliers/:id', authenticate, requireAdmin, supplierCtrl.deleteSupplier);

// --- POS & Transaction Routes ---
router.post('/pos/checkout', authenticate, requireStaffOrAdmin, posCtrl.createSale);
router.get('/transactions', authenticate, transactionCtrl.getTransactions);
router.get('/transactions/:id', authenticate, transactionCtrl.getTransactionById);

// --- Returns Routes ---
router.post('/returns', authenticate, requireStaffOrAdmin, returnCtrl.processReturn);
router.get('/returns', authenticate, requireStaffOrAdmin, returnCtrl.getReturns);

// --- Ledger Routes (Admin Only) ---
router.get('/ledger', authenticate, requireAdmin, ledgerCtrl.getLedgerEntries);
router.post('/ledger', authenticate, requireAdmin, ledgerCtrl.createManualLedgerEntry);

// --- Reports & Dashboard Routes (Admin Only) ---
router.get('/reports/dashboard', authenticate, requireAdmin, reportCtrl.getDashboardStats);
router.get('/reports/sales', authenticate, requireAdmin, reportCtrl.getSalesReport);
router.get('/reports/products', authenticate, requireAdmin, reportCtrl.getProductReport);
router.get('/reports/inventory', authenticate, requireAdmin, reportCtrl.getInventoryReport);
router.get('/reports/payments', authenticate, requireAdmin, reportCtrl.getPaymentReport);

export default router;
