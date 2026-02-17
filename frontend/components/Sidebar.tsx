
import React from 'react';
import { 
  LayoutDashboard, 
  Store, 
  Briefcase, 
  Gem, 
  MapPin, 
  UserSquare, 
  Users, 
  UserPlus, 
  CheckCircle, 
  PackageSearch, 
  FileText, 
  ShieldCheck, 
  Receipt, 
  SearchCheck,
  Wallet, 
  ArrowRightLeft, 
  FileCheck,
  Flame, 
  BadgeDollarSign,
  Terminal,
  ChevronRight
} from 'lucide-react';
import { View, UserRole } from '../types';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  userRole: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, userRole }) => {
  const menuItems = [
    { name: View.Dashboard, icon: LayoutDashboard, section: 'General', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    
    { name: View.FranchiseMaster, icon: Store, section: 'Masters', roles: ['ADMIN', 'MANAGER'] },
    { name: View.DesignationMaster, icon: Briefcase, section: 'Masters', roles: ['ADMIN'] },
    { name: View.OrnamentMaster, icon: Gem, section: 'Masters', roles: ['ADMIN', 'MANAGER'] },
    { name: View.HubMaster, icon: MapPin, section: 'Masters', roles: ['ADMIN'] },
    { name: View.BuyerMaster, icon: UserSquare, section: 'Masters', roles: ['ADMIN', 'MANAGER'] },
    { name: View.StaffMaster, icon: Users, section: 'Masters', roles: ['ADMIN'] },
    
    { name: View.CustomerMaster, icon: UserPlus, section: 'Transactions', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: View.KYCCheck, icon: CheckCircle, section: 'Transactions', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: View.MaterialInward, icon: PackageSearch, section: 'Transactions', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: View.Quotation, icon: FileText, section: 'Transactions', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: View.RHApproval, icon: ShieldCheck, section: 'Transactions', roles: ['ADMIN', 'MANAGER'] },
    { name: View.Invoice, icon: Receipt, section: 'Transactions', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: View.AccountsVerify, icon: SearchCheck, section: 'Transactions', roles: ['ADMIN', 'MANAGER'] },
    { name: View.Payment, icon: Wallet, section: 'Transactions', roles: ['ADMIN', 'MANAGER'] },
    { name: View.HubTransfer, icon: ArrowRightLeft, section: 'Transactions', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: View.HubReceipt, icon: FileCheck, section: 'Transactions', roles: ['ADMIN', 'MANAGER', 'STAFF'] },
    { name: View.Melting, icon: Flame, section: 'Transactions', roles: ['ADMIN', 'MANAGER'] },
    { name: View.Sales, icon: BadgeDollarSign, section: 'Transactions', roles: ['ADMIN', 'MANAGER'] },
    
    { name: View.AuditLogs, icon: Terminal, section: 'System', roles: ['ADMIN'] },
  ];

  const sections = ['General', 'Masters', 'Transactions', 'System'];

  return (
    <aside className="w-64 bg-slate-900 h-screen sticky top-0 flex flex-col overflow-y-auto shadow-2xl z-50">
      <div className="p-8 border-b border-slate-800 flex flex-col gap-2 bg-slate-900/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Gem className="w-5 h-5 text-slate-900" />
          </div>
          <h1 className="text-lg font-black text-white uppercase tracking-tighter">TRUE MONEY</h1>
        </div>
        <span className="text-[9px] tracking-[0.3em] text-slate-500 uppercase font-bold leading-none">ERP Infrastructure</span>
      </div>

      <nav className="flex-1 py-6 px-4 space-y-8">
        {sections.map((section) => {
          const visibleItems = menuItems.filter(item => item.section === section && item.roles.includes(userRole));
          if (visibleItems.length === 0) return null;

          return (
            <div key={section} className="space-y-2">
              <h2 className="px-4 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">
                {section}
              </h2>
              <div className="space-y-1">
                {visibleItems.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setView(item.name)}
                      className={`w-full flex items-center px-4 py-3 text-xs font-bold transition-all rounded-xl group ${
                        currentView === item.name
                          ? 'bg-amber-500 text-slate-900 shadow-xl shadow-amber-500/10'
                          : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <item.icon className={`w-4 h-4 mr-3 transition-colors ${currentView === item.name ? 'text-slate-900' : 'text-slate-500 group-hover:text-amber-500'}`} />
                      <span className="flex-1 text-left">{item.name}</span>
                      {currentView === item.name && <ChevronRight className="w-3 h-3" />}
                    </button>
                  ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="p-6 mt-auto bg-slate-950/50 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800 flex items-center justify-center text-amber-500 font-black shadow-inner border border-slate-700">
            {userRole.charAt(0)}
          </div>
          <div>
            <p className="text-[10px] font-black text-white uppercase tracking-wider leading-none mb-1">Authenticated</p>
            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">{userRole} Session</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
