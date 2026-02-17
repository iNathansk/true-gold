
export enum View {
  Dashboard = 'Dashboard',
  FranchiseMaster = 'Franchise Master',
  DesignationMaster = 'Designation',
  OrnamentMaster = 'Ornament Type',
  HubMaster = 'HUB Master',
  BuyerMaster = 'Buyer Master',
  StaffMaster = 'Staff Master',
  CustomerMaster = 'Customer Master',
  KYCCheck = 'KYC Check',
  MaterialInward = 'Material Inward',
  Quotation = 'Quotation',
  RHApproval = 'RH Approval',
  Invoice = 'Purchase Invoice',
  AccountsVerify = 'Accounts Verification',
  Payment = 'Payment',
  HubTransfer = 'Hub Transfer',
  HubReceipt = 'Hub Receipt',
  Melting = 'Melting',
  Sales = 'Sales',
  AuditLogs = 'System Audit'
}

export type UserRole = 'ADMIN' | 'MANAGER' | 'STAFF';

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  tenantId: string;
  tenantName: string;
  token: string;
}

export interface MaterialRow {
  sNo: number;
  product: string;
  piece: number;
  weight: number;
  purity: string;
  wastePercent: number;
  netWeight: number;
  rate?: number;
  amount?: number;
}

export interface TransactionData {
  branch: string;
  refNo: string;
  lotNo: string;
  date: string;
  customerAadhar: string;
  customerName: string;
  items: MaterialRow[];
  status: 'Pending' | 'Approved' | 'Rejected' | 'Invoiced' | 'Paid' | 'In Transit' | 'Received';
  remarks?: string;
  aiRiskScore?: number;
}

export interface SalesOrderItem {
  id: string;
  product: string;
  quantity: number;
  price: number;
  total: number;
}

export interface SalesOrder {
  id: string;
  buyerName: string;
  date: string;
  status: 'Draft' | 'Confirmed' | 'Processing' | 'Completed';
  items: SalesOrderItem[];
  totalAmount: number;
}

export interface MasterRecord {
  id: string;
  name: string;
  secondary?: string;
  identifier: string;
  date: string;
  kycStatus?: 'verified' | 'pending' | 'failed';
  type: View;
  details: Record<string, any>;
}

export interface AppState {
  masters: MasterRecord[];
  transactions: TransactionData[];
  salesOrders: SalesOrder[];
  goldRate: number;
  silverRate: number;
  goldTrend: 'up' | 'down' | 'stable';
  silverTrend: 'up' | 'down' | 'stable';
  lastMarketSync?: string;
  marketSources?: { title: string; uri: string }[];
}
