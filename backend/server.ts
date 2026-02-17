
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectDB, sequelize } from './db.js';
import { 
  User, Tenant, Transaction, MaterialRow, MasterRecord, 
  GlobalSetting, SalesOrder, SalesOrderItem, LogisticsDetail, 
  MeltingDetail, DisbursementRecord, KYCRecord, AuditLog 
} from './models.js';
import { seedDatabase } from './seeders.js';

const JWT_SECRET = process.env.JWT_SECRET || 'truemoney-super-secret-key-2025';
const PORT = 5000;

const app = express();
app.use(cors() as any);
app.use(express.json() as any);

// --- Auth Middlewares ---
const authenticate = (req: any, res: any, next: any) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Auth Required' });
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: 'Session Expired' });
    req.user = user;
    next();
  });
};

const logAudit = async (userId: string, action: string, module: string, payload: any) => {
  try { await (AuditLog as any).create({ user_id: userId, action, module, payload }); } catch (e) {}
};

// --- Authentication ---
app.post('/api/auth/login', async (req: any, res: any) => {
  const { username, password } = req.body;
  const user: any = await (User as any).findOne({ where: { username }, include: [Tenant] });
  if (!user || !(await bcrypt.compare(password, user.password_hash))) 
    return res.status(400).json({ error: 'Invalid Credentials' });

  const token = jwt.sign({ userId: user.id, tenantId: user.tenant_id, role: user.role_id }, JWT_SECRET, { expiresIn: '8h' });
  res.json({ id: user.id, username: user.username, role: user.role_id, tenantId: user.tenant_id, tenantName: user.tenant.name, token });
});

// --- State Sync (Dashboard) ---
app.get('/api/state', authenticate, async (req: any, res: any) => {
  const { tenantId } = req.user;
  const masters = await (MasterRecord as any).findAll({ where: { tenant_id: tenantId } });
  const transactions = await (Transaction as any).findAll({ 
    where: { tenant_id: tenantId },
    include: [
      { model: MaterialRow, as: 'items' },
      { model: LogisticsDetail, as: 'logistics' },
      { model: MeltingDetail, as: 'melting' },
      { model: DisbursementRecord, as: 'payment' }
    ]
  });
  const salesOrders = await (SalesOrder as any).findAll({
    where: { tenant_id: tenantId },
    include: [{ model: SalesOrderItem, as: 'items' }]
  });
  const settings = await (GlobalSetting as any).findAll({ where: { tenant_id: tenantId } });
  
  res.json({ 
    masters, transactions, salesOrders, 
    goldRate: parseFloat(settings.find((s:any) => s.key === 'goldRate')?.value || '0'),
    silverRate: parseFloat(settings.find((s:any) => s.key === 'silverRate')?.value || '0')
  });
});

// --- Module: KYC Check ---
app.post('/api/kyc/verify', authenticate, async (req: any, res: any) => {
  const { aadharMasked, name, status, remarks } = req.body;
  const record = await (KYCRecord as any).create({
    tenant_id: req.user.tenantId, aadhar_masked: aadharMasked, full_name: name, status, remarks
  });
  await logAudit(req.user.userId, 'VERIFY', 'KYC', { aadharMasked, status });
  res.json(record);
});

// --- Module: Masters (Franchise, Designation, Hub, Staff, etc.) ---
app.post('/api/masters', authenticate, async (req: any, res: any) => {
  await (MasterRecord as any).upsert({ ...req.body, tenant_id: req.user.tenantId });
  await logAudit(req.user.userId, 'UPSERT', 'MASTER', req.body);
  res.json({ success: true });
});

// --- Module: Material Inward & Quotation ---
app.post('/api/transactions', authenticate, async (req: any, res: any) => {
  const { lotNo, branch, refNo, date, customerAadhar, customerName, status, remarks, items } = req.body;
  const t = await sequelize.transaction();
  try {
    await (Transaction as any).upsert({ 
      lotNo, tenant_id: req.user.tenantId, branch, refNo, date, customerAadhar, customerName, status, remarks 
    }, { transaction: t });
    await (MaterialRow as any).destroy({ where: { transaction_id: lotNo }, transaction: t });
    if (items?.length) await (MaterialRow as any).bulkCreate(items.map((i:any) => ({ ...i, transaction_id: lotNo })), { transaction: t });
    await t.commit();
    await logAudit(req.user.userId, 'SYNC', 'TRANSACTION', { lotNo, status });
    res.json({ success: true });
  } catch (e) { await t.rollback(); res.status(500).json({ error: 'Transaction Sync Error' }); }
});

// --- Module: RH Approval ---
app.post('/api/workflow/approve', authenticate, async (req: any, res: any) => {
  const { lotNo, decision, remarks } = req.body;
  await (Transaction as any).update({ status: decision, remarks, audit_by: req.user.userId, audit_date: new Date() }, { where: { lotNo } });
  await logAudit(req.user.userId, 'APPROVE', 'RH_APPROVAL', { lotNo, decision });
  res.json({ success: true });
});

// --- Module: Purchase Invoice ---
app.post('/api/workflow/invoice', authenticate, async (req: any, res: any) => {
  const { lotNo, remarks } = req.body;
  await (Transaction as any).update({ status: 'Invoiced', remarks }, { where: { lotNo } });
  await logAudit(req.user.userId, 'INVOICE', 'BILLING', { lotNo });
  res.json({ success: true });
});

// --- Module: Accounts Verification ---
app.post('/api/workflow/verify', authenticate, async (req: any, res: any) => {
  const { lotNo } = req.body;
  await (Transaction as any).update({ status: 'Received' }, { where: { lotNo } });
  await logAudit(req.user.userId, 'VERIFY', 'ACCOUNTS', { lotNo });
  res.json({ success: true });
});

// --- Module: Hub Transfer & Receipt ---
app.post('/api/workflow/transfer', authenticate, async (req: any, res: any) => {
  const { lotNo, vehicleNo, driverName, sealNumber } = req.body;
  const t = await sequelize.transaction();
  try {
    await (Transaction as any).update({ status: 'In Transit' }, { where: { lotNo }, transaction: t });
    await (LogisticsDetail as any).upsert({ transaction_id: lotNo, vehicleNo, driverName, sealNumber, dispatchedAt: new Date() }, { transaction: t });
    await t.commit();
    await logAudit(req.user.userId, 'TRANSFER', 'LOGISTICS', { lotNo, vehicleNo });
    res.json({ success: true });
  } catch (e) { await t.rollback(); res.status(500).json({ error: 'Transfer Init Failed' }); }
});

app.post('/api/workflow/receive', authenticate, async (req: any, res: any) => {
  const { lotNo, remarks } = req.body;
  const t = await sequelize.transaction();
  try {
    await (Transaction as any).update({ status: 'Received', remarks }, { where: { lotNo }, transaction: t });
    await (LogisticsDetail as any).update({ receivedAt: new Date() }, { where: { transaction_id: lotNo }, transaction: t });
    await t.commit();
    await logAudit(req.user.userId, 'RECEIVE', 'LOGISTICS', { lotNo });
    res.json({ success: true });
  } catch (e) { await t.rollback(); res.status(500).json({ error: 'Receipt logic failed' }); }
});

// --- Module: Melting ---
app.post('/api/workflow/melt', authenticate, async (req: any, res: any) => {
  const { lotNo, inputWeight, outputWeight, operator, temperature } = req.body;
  const t = await sequelize.transaction();
  try {
    const loss = inputWeight - outputWeight;
    await (Transaction as any).update({ status: 'Approved', remarks: 'Melted' }, { where: { lotNo }, transaction: t });
    await (MeltingDetail as any).upsert({ transaction_id: lotNo, inputWeight, outputWeight, lossWeight: loss, operator, temperature, meltDate: new Date() }, { transaction: t });
    await t.commit();
    await logAudit(req.user.userId, 'MELT', 'REFINING', { lotNo, outputWeight });
    res.json({ success: true });
  } catch (e) { await t.rollback(); res.status(500).json({ error: 'Melting Log Failed' }); }
});

// --- Module: Payment ---
app.post('/api/workflow/disburse', authenticate, async (req: any, res: any) => {
  const { lotNo, paymentMode, referenceNo, amount } = req.body;
  const t = await sequelize.transaction();
  try {
    await (Transaction as any).update({ status: 'Paid' }, { where: { lotNo }, transaction: t });
    await (DisbursementRecord as any).upsert({ transaction_id: lotNo, paymentMode, referenceNo, amount, paidAt: new Date(), verified_by: req.user.userId }, { transaction: t });
    await t.commit();
    await logAudit(req.user.userId, 'PAY', 'FINANCE', { lotNo, amount, referenceNo });
    res.json({ success: true });
  } catch (e) { await t.rollback(); res.status(500).json({ error: 'Payment logic failed' }); }
});

// --- Module: Sales (Institutional) ---
app.post('/api/sales-orders', authenticate, async (req: any, res: any) => {
  const { id, buyerName, date, status, totalAmount, items } = req.body;
  const t = await sequelize.transaction();
  try {
    await (SalesOrder as any).upsert({ id, tenant_id: req.user.tenantId, buyerName, date, status, totalAmount }, { transaction: t });
    await (SalesOrderItem as any).destroy({ where: { sales_order_id: id }, transaction: t });
    if (items?.length) await (SalesOrderItem as any).bulkCreate(items.map((i:any) => ({ ...i, sales_order_id: id })), { transaction: t });
    await t.commit();
    await logAudit(req.user.userId, 'SYNC', 'SALES', { id, buyerName });
    res.json({ success: true });
  } catch (e) { await t.rollback(); res.status(500).json({ error: 'Sales Sync Error' }); }
});

// --- Module: Audit Logs ---
app.get('/api/audit-logs', authenticate, async (req: any, res: any) => {
  if (req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
  const logs = await (AuditLog as any).findAll({ order: [['timestamp', 'DESC']], limit: 100 });
  res.json(logs);
});

// --- Settings ---
app.post('/api/settings/market-rates', authenticate, async (req: any, res: any) => {
  const { gold, silver } = req.body;
  await (GlobalSetting as any).upsert({ tenant_id: req.user.tenantId, key: 'goldRate', value: gold.toString() });
  await (GlobalSetting as any).upsert({ tenant_id: req.user.tenantId, key: 'silverRate', value: silver.toString() });
  res.json({ success: true });
});

// --- Boot ---
const init = async () => {
  await connectDB();
  await sequelize.sync({ alter: true });
  await seedDatabase();
  app.listen(PORT, () => console.log(`🚀 ERP Backend Suite operational at http://localhost:${PORT}`));
};

init();
