
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MasterForm from './components/MasterForm';
import TransactionWorkflow from './components/TransactionWorkflow';
import KYCCheck from './components/KYCCheck';
import RHApproval from './components/RHApproval';
import PurchaseInvoice from './components/PurchaseInvoice';
import AccountsVerification from './components/AccountsVerification';
import HubReceipt from './components/HubReceipt';
import HubTransfer from './components/HubTransfer';
import Melting from './components/Melting';
import Sales from './components/Sales';
import Payment from './components/Payment';
import AuditLogs from './components/AuditLogs';
import { View, MasterRecord, TransactionData, AppState, AuthUser, SalesOrder } from './types';
import { ApiService, MarketService } from './api';
import { Cloud, CloudOff, AlertCircle, Loader2, LogIn, Lock, User, Gem, LogOut, Activity, ExternalLink } from 'lucide-react';

const STORAGE_KEY = 'true_money_erp_state';

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [serverConnected, setServerConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nextSyncIn, setNextSyncIn] = useState(300);
  
  const [state, setState] = useState<AppState>({ 
    masters: [], 
    transactions: [], 
    salesOrders: [],
    goldRate: 0, 
    silverRate: 0,
    goldTrend: 'stable',
    silverTrend: 'stable',
    marketSources: []
  });

  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const init = async () => {
      const savedAuth = localStorage.getItem('true_money_auth');
      if (savedAuth) {
        setUser(JSON.parse(savedAuth));
        await loadData();
      } else {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const serverState = await ApiService.getFullState();
    if (serverState) {
      setState(prev => ({ ...prev, ...serverState }));
      setServerConnected(true);
    } else {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setState(JSON.parse(saved));
      setServerConnected(false);
    }
    setIsLoading(false);
    await syncMarketRates();
  };

  useEffect(() => {
    if (!user) return;
    const pollInterval = setInterval(() => { syncMarketRates(); setNextSyncIn(300); }, 300000);
    const countdownInterval = setInterval(() => { setNextSyncIn(prev => prev > 0 ? prev - 1 : 0); }, 1000);
    return () => { clearInterval(pollInterval); clearInterval(countdownInterval); };
  }, [user]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);
    const loggedInUser = await ApiService.login(loginForm);
    if (loggedInUser) {
      setUser(loggedInUser);
      await loadData();
    } else {
      setLoginError('Invalid credentials or server offline.');
      setIsLoading(false);
    }
  };

  // Fix: Updated syncMarketRates to include market sources extraction
  const syncMarketRates = async () => {
    if (!user) return;
    const data = await MarketService.fetchLiveRates();
    if (data.gold && data.silver) {
      setState(prev => ({ 
        ...prev, 
        goldRate: data.gold, 
        silverRate: data.silver,
        marketSources: (data as any).sources || []
      }));
      if (serverConnected && (user.role === 'ADMIN' || user.role === 'MANAGER')) {
        await ApiService.updateMarketRates(data.gold, data.silver);
      }
    }
  };

  const updateSalesOrders = async (order: SalesOrder) => {
    setState(prev => ({ ...prev, salesOrders: [order, ...prev.salesOrders.filter(o => o.id !== order.id)] }));
    // Property syncSalesOrder now exists on ApiService
    if (serverConnected) await ApiService.syncSalesOrder(order);
  };

  const addMasterRecord = async (record: MasterRecord) => {
    setState(prev => ({ ...prev, masters: [...prev.masters, record] }));
    if (serverConnected) await ApiService.syncMaster(record);
  };

  const addTransaction = async (txn: TransactionData) => {
    setState(prev => ({ ...prev, transactions: [txn, ...prev.transactions.filter(t => t.lotNo !== txn.lotNo)] }));
    if (serverConnected) await ApiService.syncTransaction(txn);
  };

  const updateTransaction = async (lotNo: string, updates: Partial<TransactionData>) => {
    const currentTxn = state.transactions.find(t => t.lotNo === lotNo);
    if (!currentTxn) return;
    const updatedTxn = { ...currentTxn, ...updates };
    setState(prev => ({ ...prev, transactions: prev.transactions.map(t => t.lotNo === lotNo ? updatedTxn : t) }));
    if (serverConnected) await ApiService.syncTransaction(updatedTxn);
  };

  if (isLoading) return <div className="h-screen w-screen flex items-center justify-center bg-slate-900"><Loader2 className="w-12 h-12 animate-spin text-amber-500" /></div>;

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-white rounded-[3rem] shadow-2xl overflow-hidden">
        <header className="bg-slate-900 py-10 text-center"><Gem className="w-12 h-12 text-amber-500 mx-auto mb-4" /><h1 className="text-2xl font-black text-white uppercase tracking-widest">True Money ERP</h1></header>
        <form className="p-10 space-y-6" onSubmit={handleLogin}>
          {loginError && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-xs font-bold text-center">{loginError}</div>}
          <input className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 text-sm font-bold outline-none" placeholder="Username" value={loginForm.username} onChange={e => setLoginForm({...loginForm, username: e.target.value})} />
          <input className="w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 text-sm font-bold outline-none" type="password" placeholder="Password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
          <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest">Authenticate</button>
        </form>
      </div>
    </div>
  );

  const renderContent = () => {
    const isAtLeastManager = user.role === 'ADMIN' || user.role === 'MANAGER';
    switch (currentView) {
      case View.Dashboard: return <Dashboard transactions={state.transactions} />;
      case View.FranchiseMaster:
      case View.DesignationMaster:
      case View.OrnamentMaster:
      case View.HubMaster:
      case View.BuyerMaster:
      case View.StaffMaster:
      case View.CustomerMaster:
        return <MasterForm type={currentView} records={state.masters.filter(r => r.type === currentView)} onSave={addMasterRecord} />;
      case View.MaterialInward:
      case View.Quotation: return <TransactionWorkflow onSave={addTransaction} />;
      case View.KYCCheck: return <KYCCheck />;
      case View.RHApproval: return <RHApproval requests={state.transactions.filter(t => t.status === 'Pending')} onUpdate={updateTransaction} />;
      case View.Invoice: return <PurchaseInvoice approvedLots={state.transactions.filter(t => t.status === 'Approved')} onUpdate={updateTransaction} />;
      case View.AccountsVerify: return <AccountsVerification pendingVerification={state.transactions.filter(t => t.status === 'Invoiced')} onUpdate={updateTransaction} />;
      case View.Payment: return <Payment pendingPayments={state.transactions.filter(t => t.status === 'Received')} onUpdate={updateTransaction} />;
      case View.HubTransfer: return <HubTransfer readyForTransfer={state.transactions.filter(t => t.status === 'Paid')} onUpdate={updateTransaction} />;
      case View.HubReceipt: return <HubReceipt inTransitLots={state.transactions.filter(t => t.status === 'In Transit')} onUpdate={updateTransaction} />;
      case View.Melting: return <Melting receivedLots={state.transactions.filter(t => t.status === 'Received')} onUpdate={updateTransaction} />;
      case View.Sales: return <Sales processedLots={state.transactions.filter(t => t.status === 'Approved' && t.remarks?.includes('Melted'))} orders={state.salesOrders} onUpdateOrders={updateSalesOrders} goldRate={state.goldRate} silverRate={state.silverRate} />;
      case View.AuditLogs: return user.role === 'ADMIN' ? <AuditLogs state={state} onClear={() => {}} onStressTest={(t) => setState(p => ({...p, transactions: [...p.transactions, ...t]}))} /> : <Dashboard transactions={state.transactions} />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentView={currentView} setView={setCurrentView} userRole={user.role} />
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-30 bg-white/95 border-b px-8 py-4 flex justify-between items-center shadow-sm">
          <div className="flex items-center gap-4">
            <Activity className="w-5 h-5 text-emerald-500" />
            <div className="flex flex-col"><span className="text-[10px] text-slate-400 font-black uppercase">{user.tenantName} • {user.role}</span><span className="text-sm font-black text-slate-900 uppercase">{currentView}</span></div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="text-[11px] font-black px-4 py-2 bg-amber-50 text-amber-600 rounded-xl border border-amber-100 uppercase">
                Gold: ₹ {state.goldRate.toLocaleString()}
              </div>
              {state.marketSources && state.marketSources.length > 0 && (
                <div className="mt-1 flex gap-2">
                  {state.marketSources.slice(0, 3).map((s, idx) => (
                    <a 
                      key={idx} 
                      href={s.uri} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-[8px] text-blue-500 underline flex items-center gap-0.5 hover:text-blue-700 transition-colors"
                      title={s.title}
                    >
                      Ref {idx + 1} <ExternalLink className="w-2 h-2" />
                    </a>
                  ))}
                </div>
              )}
            </div>
            <button onClick={() => { ApiService.logout(); setUser(null); }} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all shadow-sm">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>
        <div className="pb-32">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
