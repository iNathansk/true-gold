
import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowLeft, 
  CheckCircle2, 
  CreditCard, 
  Banknote, 
  ShieldCheck, 
  Printer, 
  Search,
  ChevronRight,
  Clock,
  History,
  ArrowUpRight
} from 'lucide-react';
import { TransactionData } from '../types';

// Added Props interface to handle pendingPayments and onUpdate passed from App.tsx
interface PaymentProps {
  pendingPayments: TransactionData[];
  onUpdate: (lotNo: string, updates: Partial<TransactionData>) => void;
}

const Payment: React.FC<PaymentProps> = ({ pendingPayments: propPending, onUpdate }) => {
  const [selectedLot, setSelectedLot] = useState<TransactionData | null>(null);
  const [paymentMode, setPaymentMode] = useState<'bank' | 'cash'>('bank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDone, setIsDone] = useState(false);

  // Use props if available, otherwise fallback to local mock data
  const [internalPending, setInternalPending] = useState<TransactionData[]>([]);

  useEffect(() => {
    if (propPending && propPending.length > 0) {
      setInternalPending(propPending);
    } else {
      // Mock Lots Released by Accounts fallback
      setInternalPending([
        {
          branch: 'Erode Main',
          refNo: 'REF-8829',
          lotNo: 'LOT-4412',
          date: '2025-02-24',
          customerAadhar: '5566-7788-9900',
          customerName: 'Ravi Kumar',
          status: 'Approved',
          items: [
            { sNo: 1, product: 'Chain', piece: 1, weight: 12.5, purity: '916', wastePercent: 2, netWeight: 12.25, rate: 7240, amount: 88690 }
          ]
        }
      ]);
    }
  }, [propPending]);

  const handleDisbursement = () => {
    if (!selectedLot) return;
    setIsProcessing(true);
    setTimeout(() => {
      onUpdate(selectedLot.lotNo, { status: 'Paid' });
      setIsProcessing(false);
      setIsDone(true);
    }, 2000);
  };

  if (isDone) {
    return (
      <div className="p-8 max-w-2xl mx-auto text-center space-y-8 animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-green-200">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Disbursement Successful</h2>
          <p className="text-slate-500 font-medium mt-2">Funds have been initiated for {selectedLot?.customerName}.</p>
        </div>
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex justify-between items-center font-mono text-sm">
          <span className="text-slate-400">UTR: BKN-{selectedLot?.lotNo.split('-')[1]}102931</span>
          <span className="text-slate-900 font-bold">₹ {selectedLot?.items.reduce((s,i)=>s+(i.amount||0),0).toLocaleString()}</span>
        </div>
        <div className="flex gap-4">
           <button onClick={() => {setIsDone(false); setSelectedLot(null);}} className="flex-1 bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs">Close Session</button>
           <button className="flex-1 border border-slate-200 font-bold py-4 rounded-xl hover:bg-slate-50 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2">
              <Printer className="w-4 h-4" /> Print Voucher
           </button>
        </div>
      </div>
    );
  }

  if (selectedLot) {
    const amount = selectedLot.items.reduce((s, i) => s + (i.amount || 0), 0);
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8 animate-in slide-in-from-right duration-300">
        <button onClick={() => setSelectedLot(null)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Queue
        </button>

        <div className="bg-white rounded-[2rem] border shadow-2xl overflow-hidden ring-1 ring-slate-100">
           <header className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-amber-500 rounded-xl">
                    <Wallet className="w-6 h-6 text-slate-900" />
                 </div>
                 <div>
                    <h2 className="text-xl font-black tracking-tight uppercase">Payment Release</h2>
                    <p className="text-[10px] text-slate-400 font-bold tracking-[0.2em] mt-1">Lot: {selectedLot.lotNo}</p>
                 </div>
              </div>
              <div className="text-right">
                 <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Payable</p>
                 <p className="text-3xl font-black text-amber-500 tracking-tighter">₹ {amount.toLocaleString()}</p>
              </div>
           </header>

           <div className="p-10 space-y-10">
              <div className="grid grid-cols-2 gap-10">
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Settlement Method</label>
                    <div className="grid grid-cols-2 gap-4">
                       <button 
                         onClick={() => setPaymentMode('bank')}
                         className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMode === 'bank' ? 'border-slate-900 bg-slate-50' : 'border-slate-100 text-slate-400'}`}
                       >
                          <CreditCard className="w-6 h-6" />
                          <span className="text-[10px] font-black uppercase">Bank Transfer</span>
                       </button>
                       <button 
                         onClick={() => setPaymentMode('cash')}
                         className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${paymentMode === 'cash' ? 'border-slate-900 bg-slate-50' : 'border-slate-100 text-slate-400'}`}
                       >
                          <Banknote className="w-6 h-6" />
                          <span className="text-[10px] font-black uppercase">Cash Out</span>
                       </button>
                    </div>
                 </div>
                 
                 <div className="space-y-4">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Beneficiary Detail</label>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                       <p className="text-xs font-black text-slate-900">{selectedLot.customerName}</p>
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{paymentMode === 'bank' ? 'HDFC Bank - ****4412' : 'Counter ID: C-001'}</p>
                    </div>
                 </div>
              </div>

              <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex items-center gap-6">
                 <ShieldCheck className="w-8 h-8 text-amber-600 shrink-0" />
                 <p className="text-[11px] text-amber-800 font-bold uppercase tracking-wide leading-tight">
                    I confirm that the bank details provided have been verified against the KYC documents on record. Disbursement is final.
                 </p>
              </div>

              <button 
                onClick={handleDisbursement}
                disabled={isProcessing}
                className="w-full bg-slate-900 text-white font-black py-6 rounded-2xl shadow-xl hover:bg-slate-800 transition-all uppercase tracking-[0.3em] text-sm flex items-center justify-center gap-3"
              >
                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Authorize Disbursement'}
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
       <header className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Payment & Disbursement</h2>
            <p className="text-slate-500 text-sm">Execute final settlement of funds for verified transactions.</p>
          </div>
          <div className="bg-white border rounded-xl p-4 shadow-sm flex items-center gap-6">
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Cash Balance</p>
                <p className="text-sm font-bold text-slate-900">₹ 14.80 L</p>
             </div>
             <div className="h-8 w-px bg-slate-100"></div>
             <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Bank Pool</p>
                <p className="text-sm font-bold text-slate-900">₹ 82.50 L</p>
             </div>
          </div>
       </header>

       <div className="bg-white rounded-3xl border shadow-sm overflow-hidden ring-1 ring-slate-100">
          <div className="p-6 bg-slate-50 border-b flex items-center justify-between">
             <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-slate-400" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Awaiting Disbursement</h3>
             </div>
             <div className="relative">
                <input type="text" placeholder="Search Payee..." className="pl-9 pr-4 py-2 border rounded-xl text-xs outline-none focus:ring-2 focus:ring-slate-900 w-64" />
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
             </div>
          </div>
          <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead>
                   <tr className="bg-slate-50/50 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      <th className="px-8 py-5">Lot ID</th>
                      <th className="px-8 py-5">Payee Name</th>
                      <th className="px-8 py-5">Status</th>
                      <th className="px-8 py-5">Verified Date</th>
                      <th className="px-8 py-5 text-right">Settlement Amt</th>
                      <th className="px-8 py-5 text-right">Action</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {internalPending.map(pay => (
                     <tr key={pay.lotNo} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6 font-bold text-slate-900">{pay.lotNo}</td>
                        <td className="px-8 py-6 font-medium">{pay.customerName}</td>
                        <td className="px-8 py-6">
                           <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[9px] font-black uppercase">{pay.status}</span>
                        </td>
                        <td className="px-8 py-6 text-xs text-slate-400 font-bold">{pay.date}</td>
                        <td className="px-8 py-6 text-right font-black text-slate-900">₹ {pay.items.reduce((s,i)=>s+(i.amount||0),0).toLocaleString()}</td>
                        <td className="px-8 py-6 text-right">
                           <button 
                             onClick={() => setSelectedLot(pay)}
                             className="bg-slate-900 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                           >
                              Release Funds
                           </button>
                        </td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
       </div>
    </div>
  );
};

const Loader2 = (props: any) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>;

export default Payment;
