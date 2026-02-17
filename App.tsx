
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
import { View, MasterRecord, TransactionData, AppState } from './types';
import { ApiService } from './api';
import { Sparkles, X, Send, Loader2, Database, ShieldAlert, Cloud, CloudOff, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

const STORAGE_KEY = 'true_money_erp_state';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Dashboard);
  const [serverConnected, setServerConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<AppState>({ masters: [], transactions: [], goldRate: 7240 });

  // 1. Initial Data Load from MariaDB
  useEffect(() => {
    const initData = async () => {
      setIsLoading(true);
      const serverState = await ApiService.getFullState();
      if (serverState) {
        setState(serverState);
        setServerConnected(true);
      } else {
        // Fallback to local storage if DB is down
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) setState(JSON.parse(saved));
        setServerConnected(false);
      }
      setIsLoading(false);
    };
    initData();
  }, []);

  // 2. Persistent Local Cache for Offline Resilience
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addMasterRecord = async (record: MasterRecord) => {
    setState(prev => ({ ...prev, masters: [...prev.masters, record] }));
    if (serverConnected) await ApiService.syncMaster(record);
  };

  const addTransaction = async (txn: TransactionData) => {
    // Check for existing lot to prevent duplicates
    const exists = state.transactions.find(t => t.lotNo === txn.lotNo);
    if (exists) {
      await updateTransaction(txn.lotNo, txn);
      return;
    }
    setState(prev => ({ ...prev, transactions: [...prev.transactions, txn] }));
    if (serverConnected) await ApiService.syncTransaction(txn);
  };

  const updateTransaction = async (lotNo: string, updates: Partial<TransactionData>) => {
    const currentTxn = state.transactions.find(t => t.lotNo === lotNo);
    if (!currentTxn) return;

    const updatedTxn = { ...currentTxn, ...updates };
    setState(prev => ({
      ...prev,
      transactions: prev.transactions.map(t => t.lotNo === lotNo ? updatedTxn : t)
    }));

    if (serverConnected) {
      const success = await ApiService.syncTransaction(updatedTxn);
      if (!success) setServerConnected(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-amber-500" />
        <p className="font-black uppercase tracking-[0.3em] text-xs">Initializing MariaDB Node...</p>
      </div>
    );
  }

  const renderContent = () => {
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
      case View.Sales: return <Sales processedLots={state.transactions.filter(t => t.status === 'Approved' && t.remarks?.includes('Melted'))} goldRate={state.goldRate} />;
      case View.AuditLogs: return <AuditLogs state={state} onClear={() => {}} onStressTest={() => {}} />;
      default: return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 overflow-y-auto relative">
        {!serverConnected && (
          <div className="bg-rose-600 text-white py-2 px-8 flex justify-center items-center gap-3 text-[10px] font-black uppercase tracking-widest sticky top-0 z-50">
            <AlertCircle className="w-4 h-4" />
            Database Connection Lost. Operating in Offline Cache Mode. Changes will sync once back online.
          </div>
        )}
        <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b px-8 py-5 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className={`p-2 rounded-lg ${serverConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
              {serverConnected ? <Cloud className="w-4 h-4" /> : <CloudOff className="w-4 h-4" />}
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mb-1">
                {serverConnected ? 'Production Node: TRU-SQL-MARIA' : 'Local Cache: SYNC-PENDING'}
              </span>
              <span className="text-sm font-black text-slate-900 uppercase tracking-widest">{currentView}</span>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 text-[10px] font-black text-amber-600 bg-amber-50 px-5 py-2 rounded-full border border-amber-100 uppercase tracking-widest shadow-sm">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse ring-2 ring-green-100"></span>
              Market Gold Rate: ₹ {state.goldRate}
            </div>
          </div>
        </header>

        <div className="pb-32">{renderContent()}</div>
      </main>
    </div>
  );
};

export default App;
