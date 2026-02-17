
import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  CheckCircle, 
  ArrowLeft, 
  Package, 
  Building2, 
  Calendar,
  AlertTriangle,
  User,
  Search,
  CheckCircle2
} from 'lucide-react';
import { TransactionData, MaterialRow } from '../types';

// Added Props interface to handle pendingVerification and onUpdate passed from App.tsx
interface AccountsVerificationProps {
  pendingVerification: TransactionData[];
  onUpdate: (lotNo: string, updates: Partial<TransactionData>) => void;
}

const AccountsVerification: React.FC<AccountsVerificationProps> = ({ pendingVerification: propPending, onUpdate }) => {
  const [selectedAudit, setSelectedAudit] = useState<TransactionData | null>(null);
  const [isValidated, setIsValidated] = useState(false);

  // Use props if available, otherwise fallback to local mock data
  const [internalPending, setInternalPending] = useState<TransactionData[]>([]);

  useEffect(() => {
    if (propPending && propPending.length > 0) {
      setInternalPending(propPending);
    } else {
      // Mock Invoiced Lots for Verification fallback
      setInternalPending([
        {
          branch: 'Erode Main',
          refNo: 'REF-8829',
          lotNo: 'LOT-4412',
          date: '2025-02-24',
          customerAadhar: '5566-7788-9900',
          customerName: 'Ravi Kumar',
          status: 'Invoiced',
          items: [
            { sNo: 1, product: 'Chain', piece: 1, weight: 12.5, purity: '916', wastePercent: 2, netWeight: 12.25, rate: 7240, amount: 88690 },
            { sNo: 2, product: 'Bangles', piece: 2, weight: 24.0, purity: '916', wastePercent: 1.5, netWeight: 23.64, rate: 7240, amount: 171153.6 }
          ]
        }
      ]);
    }
  }, [propPending]);

  const calculateTotalPieces = (items: MaterialRow[]) => items.reduce((sum, item) => sum + item.piece, 0);
  const calculateTotalWeight = (items: MaterialRow[]) => items.reduce((sum, item) => sum + item.weight, 0);
  const calculateTotalNetWeight = (items: MaterialRow[]) => items.reduce((sum, item) => sum + item.netWeight, 0);
  const calculateTotalAmount = (items: MaterialRow[]) => items.reduce((sum, item) => sum + (item.amount || 0), 0);

  const handleAuditRelease = () => {
    if (!selectedAudit) return;
    onUpdate(selectedAudit.lotNo, { status: 'Received' }); // Or whatever next status is in flow
    alert(`Audit passed for ${selectedAudit.lotNo}. Released for Payment.`);
    setSelectedAudit(null);
    setIsValidated(false);
  };

  if (selectedAudit) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in zoom-in duration-300">
        <button onClick={() => setSelectedAudit(null)} className="flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden border-blue-100 ring-4 ring-blue-50/50">
          <header className="px-8 py-6 bg-slate-900 text-white flex justify-between items-center">
             <div className="flex items-center gap-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                   <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                   <h2 className="text-xl font-black tracking-tight">Accounts Verification (Section 7)</h2>
                   <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest leading-none mt-1">Audit Level Check</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Audit Date</p>
                <p className="text-sm font-bold">{new Date().toLocaleDateString('en-GB')}</p>
             </div>
          </header>

          <div className="p-8 space-y-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pb-6 border-b border-slate-100">
              <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ref No</p><p className="text-sm font-bold text-slate-900">{selectedAudit.refNo}</p></div>
              <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Branch</p><p className="text-sm font-bold text-slate-900">{selectedAudit.branch}</p></div>
              <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Lot No</p><p className="text-sm font-bold text-amber-600">{selectedAudit.lotNo}</p></div>
              <div><p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Party Name</p><p className="text-sm font-bold text-slate-900">{selectedAudit.customerName}</p></div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-100">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                  <tr>
                    <th className="px-4 py-3">1. SNo</th>
                    <th className="px-4 py-3">2. Product</th>
                    <th className="px-4 py-3">3. Piece</th>
                    <th className="px-4 py-3">4. Weight</th>
                    <th className="px-4 py-3">5. Purity</th>
                    <th className="px-4 py-3">6. Waste %</th>
                    <th className="px-4 py-3">7. Net Weight</th>
                    <th className="px-4 py-3">8. Rate</th>
                    <th className="px-4 py-3 text-right">9. Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedAudit.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-4">{item.sNo}</td>
                      <td className="px-4 py-4 font-bold text-slate-900">{item.product}</td>
                      <td className="px-4 py-4 font-medium">{item.piece}</td>
                      <td className="px-4 py-4 font-medium">{item.weight}g</td>
                      <td className="px-4 py-4 text-slate-500">{item.purity}</td>
                      <td className="px-4 py-4 text-slate-500">{item.wastePercent}%</td>
                      <td className="px-4 py-4 font-bold text-blue-700">{item.netWeight.toFixed(3)}g</td>
                      <td className="px-4 py-4 text-slate-600">₹ {item.rate?.toLocaleString()}</td>
                      <td className="px-4 py-4 text-right font-bold text-slate-900">₹ {item.amount?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-blue-50/30 border-t font-bold text-slate-900">
                   <tr>
                     <td colSpan={2} className="px-4 py-4 text-[10px] uppercase text-slate-400 text-right">Verification Totals</td>
                     <td className="px-4 py-4">{calculateTotalPieces(selectedAudit.items)}</td>
                     <td className="px-4 py-4">{calculateTotalWeight(selectedAudit.items).toFixed(3)}g</td>
                     <td colSpan={2}></td>
                     <td className="px-4 py-4 text-blue-700">{calculateTotalNetWeight(selectedAudit.items).toFixed(3)}g</td>
                     <td></td>
                     <td className="px-4 py-4 text-right">₹ {calculateTotalAmount(selectedAudit.items).toLocaleString()}</td>
                   </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                <div className="flex items-center gap-4">
                   <div 
                      onClick={() => setIsValidated(!isValidated)}
                      className={`w-10 h-10 rounded-xl border-2 flex items-center justify-center cursor-pointer transition-all shadow-sm ${isValidated ? 'bg-green-600 border-green-600' : 'bg-white border-slate-300 hover:border-blue-400'}`}
                    >
                      {isValidated && <CheckCircle2 className="w-6 h-6 text-white" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 uppercase tracking-wide text-sm">Validate Invoice Qty and Quotation Qty : Tik Box</h4>
                      <p className="text-xs text-slate-500">Cross-reference final weights and piece counts against approved branch records.</p>
                    </div>
                </div>
                <button 
                  disabled={!isValidated}
                  onClick={handleAuditRelease}
                  className={`px-10 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg ${isValidated ? 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                >
                   Release for Payment
                </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-2xl font-bold text-slate-900">Accounts Verification (Section 7)</h2>
        <p className="text-slate-500 text-sm">Final audit step before disbursement of funds.</p>
      </header>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b flex items-center justify-between">
           <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
              <Search className="w-4 h-4" /> Filter Audit Queue
           </div>
           <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">System Ready for Audit</span>
        </div>
        <table className="w-full text-left text-sm">
           <thead>
              <tr className="border-b text-slate-400 text-[10px] uppercase font-bold tracking-widest bg-slate-50/30">
                 <th className="px-8 py-4">Lot ID</th>
                 <th className="px-8 py-4">Branch</th>
                 <th className="px-8 py-4">Party</th>
                 <th className="px-8 py-4">Auditable Amt</th>
                 <th className="px-8 py-4">Status</th>
                 <th className="px-8 py-4 text-right">Audit</th>
              </tr>
           </thead>
           <tbody className="divide-y divide-slate-100">
              {internalPending.map(audit => (
                <tr key={audit.lotNo} className="hover:bg-blue-50/30 transition-colors group">
                   <td className="px-8 py-5 font-bold text-slate-900">{audit.lotNo}</td>
                   <td className="px-8 py-5 text-slate-600 font-medium">{audit.branch}</td>
                   <td className="px-8 py-5 font-medium">{audit.customerName}</td>
                   <td className="px-8 py-5 font-bold">₹ {calculateTotalAmount(audit.items).toLocaleString()}</td>
                   <td className="px-8 py-5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-blue-100 text-blue-700 border border-blue-200">
                        {audit.status}
                      </span>
                   </td>
                   <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setSelectedAudit(audit)}
                        className="bg-slate-900 text-white px-4 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-600 transition-all shadow-md active:scale-95"
                      >
                         Execute Audit
                      </button>
                   </td>
                </tr>
              ))}
           </tbody>
        </table>
      </div>
    </div>
  );
};

export default AccountsVerification;
