
import { DataTypes, Model } from 'sequelize';
import { sequelize } from './db.js';

// --- Identity & Access ---
export class Tenant extends Model {}
(Tenant as any).init({
  id: { type: DataTypes.STRING, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  active: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { sequelize, modelName: 'tenant' });

export class Role extends Model {}
(Role as any).init({
  id: { type: DataTypes.STRING, primaryKey: true },
  description: { type: DataTypes.STRING }
}, { sequelize, modelName: 'role' });

export class User extends Model {}
(User as any).init({
  id: { type: DataTypes.STRING, primaryKey: true },
  username: { type: DataTypes.STRING, unique: true, allowNull: false },
  password_hash: { type: DataTypes.STRING, allowNull: false },
  role_id: { type: DataTypes.STRING, allowNull: false },
  tenant_id: { type: DataTypes.STRING, allowNull: false }
}, { sequelize, modelName: 'user' });

// --- Master Data (Polymorphic) ---
// Covers: Franchise, Designation, Ornament Type, HUB, Buyer, Staff, Customer
export class MasterRecord extends Model {}
(MasterRecord as any).init({
  id: { type: DataTypes.STRING, primaryKey: true },
  tenant_id: { type: DataTypes.STRING, allowNull: false },
  name: { type: DataTypes.STRING, allowNull: false },
  identifier: { type: DataTypes.STRING, allowNull: false }, // Aadhaar, Code, GSTIN
  secondary: { type: DataTypes.STRING }, // Mobile, Branch
  date: { type: DataTypes.STRING },
  kycStatus: { type: DataTypes.STRING }, // verified, pending, failed
  type: { type: DataTypes.STRING, allowNull: false }, 
  details: { type: DataTypes.JSON }
}, { sequelize, modelName: 'master_record' });

// --- KYC Compliance Hub ---
export class KYCRecord extends Model {}
(KYCRecord as any).init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  tenant_id: { type: DataTypes.STRING, allowNull: false },
  aadhar_masked: { type: DataTypes.STRING, allowNull: false },
  full_name: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
  remarks: { type: DataTypes.TEXT },
  verified_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { sequelize, modelName: 'kyc_record' });

// --- Transactional Core (Procurement Workflow) ---
// Covers: Material Inward, Quotation, RH Approval, Purchase Invoice, Accounts Verification
export class Transaction extends Model {}
(Transaction as any).init({
  lotNo: { type: DataTypes.STRING, primaryKey: true },
  tenant_id: { type: DataTypes.STRING, allowNull: false },
  branch: { type: DataTypes.STRING },
  refNo: { type: DataTypes.STRING },
  date: { type: DataTypes.STRING },
  customerAadhar: { type: DataTypes.STRING },
  customerName: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING }, // Pending, Approved, Invoiced, Paid, In Transit, Received
  remarks: { type: DataTypes.TEXT },
  audit_by: { type: DataTypes.STRING },
  audit_date: { type: DataTypes.DATE }
}, { sequelize, modelName: 'transaction' });

export class MaterialRow extends Model {}
(MaterialRow as any).init({
  transaction_id: { type: DataTypes.STRING, allowNull: false },
  sNo: { type: DataTypes.INTEGER },
  product: { type: DataTypes.STRING },
  piece: { type: DataTypes.INTEGER },
  weight: { type: DataTypes.DOUBLE },
  purity: { type: DataTypes.STRING },
  wastePercent: { type: DataTypes.DOUBLE },
  netWeight: { type: DataTypes.DOUBLE },
  rate: { type: DataTypes.DOUBLE },
  amount: { type: DataTypes.DOUBLE }
}, { sequelize, modelName: 'material_row' });

// --- Specialized Operations ---

// Hub Logistics (Transfer / Receipt)
export class LogisticsDetail extends Model {}
(LogisticsDetail as any).init({
  transaction_id: { type: DataTypes.STRING, primaryKey: true },
  vehicleNo: { type: DataTypes.STRING },
  driverName: { type: DataTypes.STRING },
  sealNumber: { type: DataTypes.STRING },
  dispatchedAt: { type: DataTypes.DATE },
  receivedAt: { type: DataTypes.DATE }
}, { sequelize, modelName: 'logistics_detail' });

// Melting / Refining
export class MeltingDetail extends Model {}
(MeltingDetail as any).init({
  transaction_id: { type: DataTypes.STRING, primaryKey: true },
  inputWeight: { type: DataTypes.DOUBLE },
  outputWeight: { type: DataTypes.DOUBLE },
  lossWeight: { type: DataTypes.DOUBLE },
  operator: { type: DataTypes.STRING },
  temperature: { type: DataTypes.INTEGER },
  meltDate: { type: DataTypes.DATE }
}, { sequelize, modelName: 'melting_detail' });

// Payment / Disbursement
export class DisbursementRecord extends Model {}
(DisbursementRecord as any).init({
  transaction_id: { type: DataTypes.STRING, primaryKey: true },
  paymentMode: { type: DataTypes.STRING },
  referenceNo: { type: DataTypes.STRING },
  amount: { type: DataTypes.DOUBLE },
  paidAt: { type: DataTypes.DATE },
  verified_by: { type: DataTypes.STRING }
}, { sequelize, modelName: 'disbursement_record' });

// Institutional Sales
export class SalesOrder extends Model {}
(SalesOrder as any).init({
  id: { type: DataTypes.STRING, primaryKey: true },
  tenant_id: { type: DataTypes.STRING, allowNull: false },
  buyerName: { type: DataTypes.STRING, allowNull: false },
  date: { type: DataTypes.STRING },
  status: { type: DataTypes.STRING },
  totalAmount: { type: DataTypes.DOUBLE }
}, { sequelize, modelName: 'sales_order' });

export class SalesOrderItem extends Model {}
(SalesOrderItem as any).init({
  sales_order_id: { type: DataTypes.STRING, allowNull: false },
  product: { type: DataTypes.STRING },
  quantity: { type: DataTypes.DOUBLE },
  price: { type: DataTypes.DOUBLE },
  total: { type: DataTypes.DOUBLE }
}, { sequelize, modelName: 'sales_order_item' });

// Settings & Globals
export class GlobalSetting extends Model {}
(GlobalSetting as any).init({
  tenant_id: { type: DataTypes.STRING, primaryKey: true },
  key: { type: DataTypes.STRING, primaryKey: true },
  value: { type: DataTypes.TEXT, allowNull: false }
}, { sequelize, modelName: 'global_setting' });

// System Audit Logs
export class AuditLog extends Model {}
(AuditLog as any).init({
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  user_id: { type: DataTypes.STRING },
  action: { type: DataTypes.STRING },
  module: { type: DataTypes.STRING },
  payload: { type: DataTypes.JSON },
  timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { sequelize, modelName: 'audit_log' });

// --- Associations ---
(User as any).belongsTo(Tenant, { foreignKey: 'tenant_id' });
(User as any).belongsTo(Role, { foreignKey: 'role_id' });
(Transaction as any).hasMany(MaterialRow, { foreignKey: 'transaction_id', as: 'items' });
(MaterialRow as any).belongsTo(Transaction, { foreignKey: 'transaction_id' });
(Transaction as any).hasOne(LogisticsDetail, { foreignKey: 'transaction_id', as: 'logistics' });
(Transaction as any).hasOne(MeltingDetail, { foreignKey: 'transaction_id', as: 'melting' });
(Transaction as any).hasOne(DisbursementRecord, { foreignKey: 'transaction_id', as: 'payment' });
(SalesOrder as any).hasMany(SalesOrderItem, { foreignKey: 'sales_order_id', as: 'items' });
(SalesOrderItem as any).belongsTo(SalesOrder, { foreignKey: 'sales_order_id' });
