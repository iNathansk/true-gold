
import bcrypt from 'bcryptjs';
import { 
  Tenant, Role, User, MasterRecord, GlobalSetting, 
  Transaction, MaterialRow, LogisticsDetail, MeltingDetail, 
  DisbursementRecord, SalesOrder, SalesOrderItem 
} from './models.js';

export const seedDatabase = async () => {
  const count = await (Tenant as any).count();
  if (count > 0) return;

  console.log('🌱 Initiating Complete ERP Suite Seeding...');

  const tenantId = 'TENANT-MAIN';
  await (Tenant as any).create({ id: tenantId, name: 'True Money Gold HQ' });

  await (Role as any).bulkCreate([
    { id: 'ADMIN', description: 'Super Administrator' },
    { id: 'MANAGER', description: 'Regional Head (RH)' },
    { id: 'STAFF', description: 'Branch Executive' }
  ]);

  const passwordHash = await bcrypt.hash('admin123', 10);
  await (User as any).create({
    id: 'USER-001',
    tenant_id: tenantId,
    username: 'admin',
    password_hash: passwordHash,
    role_id: 'ADMIN'
  });

  // --- Seed: All 7 Master Modules ---
  await (MasterRecord as any).bulkCreate([
    { id: 'FR-01', tenant_id: tenantId, name: 'Erode Main Branch', identifier: 'BR-ERD-01', type: 'Franchise Master', date: '2025-01-01', details: {} },
    { id: 'DS-01', tenant_id: tenantId, name: 'Senior Gold Appraiser', identifier: 'DS-APP-SR', type: 'Designation', date: '2025-01-01', details: {} },
    { id: 'ORN-01', tenant_id: tenantId, name: 'Gold Bangle (916/22K)', identifier: 'ORN-GLD-916', type: 'Ornament Type', date: '2025-01-01', details: {} },
    { id: 'HUB-01', tenant_id: tenantId, name: 'Coimbatore Refining Hub', identifier: 'HUB-CBE-01', type: 'HUB Master', date: '2025-01-01', details: {} },
    { id: 'BYR-01', tenant_id: tenantId, name: 'Malabar Gold & Diamonds', identifier: 'BYR-GST-MALABAR', type: 'Buyer Master', date: '2025-01-01', details: {} },
    { id: 'STF-01', tenant_id: tenantId, name: 'Rajesh Kumar', identifier: 'STF-EMP-101', type: 'Staff Master', date: '2025-01-01', details: { designation: 'Appraiser' } },
    { id: 'CUST-01', tenant_id: tenantId, name: 'Arjun Reddy', identifier: '1234-5678-9012', type: 'Customer Master', date: '2025-02-20', kycStatus: 'verified', details: { mobile: '9988776655' } }
  ]);

  // --- Seed: Full Lifecycle Workflow Transactions ---

  // 1. Pending (Material Inward -> Quotation -> Pending RH Approval)
  const lotP = 'LOT-P-001';
  await (Transaction as any).create({ lotNo: lotP, tenant_id: tenantId, branch: 'Erode', refNo: 'R-101', customerName: 'Arjun Reddy', status: 'Pending', date: '2025-02-24' });
  await (MaterialRow as any).create({ transaction_id: lotP, sNo: 1, product: 'Chain', piece: 1, weight: 10, purity: '916', wastePercent: 2, netWeight: 9.8, rate: 7200, amount: 70560 });

  // 2. In Transit (Approved -> Invoiced -> Paid -> Hub Transfer)
  const lotT = 'LOT-T-002';
  await (Transaction as any).create({ lotNo: lotT, tenant_id: tenantId, branch: 'Salem', refNo: 'R-202', customerName: 'Meera K.', status: 'In Transit', date: '2025-02-23' });
  await (LogisticsDetail as any).create({ transaction_id: lotT, vehicleNo: 'TN-33-A-1234', driverName: 'Suresh', sealNumber: 'SEAL-001', dispatchedAt: new Date() });

  // 3. Received & Melted (Hub Operations)
  const lotM = 'LOT-M-003';
  await (Transaction as any).create({ lotNo: lotM, tenant_id: tenantId, branch: 'Erode', refNo: 'R-303', customerName: 'Suresh P.', status: 'Approved', remarks: 'Melted', date: '2025-02-20' });
  await (MeltingDetail as any).create({ transaction_id: lotM, inputWeight: 100, outputWeight: 98.5, lossWeight: 1.5, operator: 'K. Balan', temperature: 1064, meltDate: new Date() });

  // 4. Institutional Sale
  const orderId = 'SO-1001';
  await (SalesOrder as any).create({ id: orderId, tenant_id: tenantId, buyerName: 'Malabar Gold', date: '2025-02-25', status: 'Confirmed', totalAmount: 500000 });
  await (SalesOrderItem as any).create({ sales_order_id: orderId, product: 'Refined Gold Bars (999)', quantity: 68.5, price: 7300, total: 500050 });

  await (GlobalSetting as any).bulkCreate([
    { tenant_id: tenantId, key: 'goldRate', value: '7250' },
    { tenant_id: tenantId, key: 'silverRate', value: '94' }
  ]);

  console.log('✅ ERP Suite Seeding Completed Successfully.');
};
