
import React, { useState, useEffect } from 'react';
import { 
  Receipt, 
  Printer, 
  ChevronRight, 
  User, 
  Package, 
  ArrowLeft,
  FileText,
  Calculator,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { TransactionData, MaterialRow } from '../types';

// Added Props interface to handle approvedLots and onUpdate passed from App.tsx
interface PurchaseInvoiceProps {
  approvedLots: TransactionData[];
  onUpdate: (lotNo: string, updates: Partial<TransactionData>) => void;
}

const PurchaseInvoice: React.FC<PurchaseInvoiceProps> = ({ approvedLots: propApprovedLots, onUpdate }) => {
  const [selectedInvoice, setSelectedInvoice] = useState<TransactionData | null>(null);
  const [useGST, setUseGST] = useState(true);
  const [invoiceRemarks, setInvoiceRemarks] = useState('');

  // Use props if available, otherwise fallback to local mock data
  const [internalApprovedLots, setInternalApprovedLots] = useState<TransactionData[]>([]);

  useEffect(() => {
    if (propApprovedLots && propApprovedLots.length > 0) {
      setInternalApprovedLots(propApprovedLots);
    } else {
      // Mock fallback
      setInternalApprovedLots([
        {
          branch: 'Erode Main',
          refNo: 'REF-8829',
          lotNo: 'LOT-4412',
          date: '2025-02-24',
          customerAadhar: '5566-7788-9900',
          customerName: 'Ravi Kumar',
          status: 'Approved',
          items: [
            { sNo: 1, product: 'Chain', piece: 1, weight: 12.5, purity: '916', wastePercent: 2, netWeight: 12.25, rate: 7240, amount: 88690 },
            { sNo: 2, product: 'Bangles', piece: 2, weight: 24.0, purity: '916', wastePercent: 1.5, netWeight: 23.64, rate: 7240, amount: 171153.6 }
          ]
        }
      ]);
    }
  }, [propApprovedLots]);

  const calculateSubtotal = (items: MaterialRow[]) => items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const calculateTotalPieces = (items: MaterialRow[]) => items.reduce((sum, item) => sum + item.piece, 0);
  const calculateTotalWeight = (items: MaterialRow[]) => items.reduce((sum, item) => sum + item.weight, 0);
  const calculateTotalNetWeight = (items: MaterialRow[]) => items.reduce((sum, item) => sum + item.netWeight, 0);

  const handleFinalizeInvoice = () => {
    if (!selectedInvoice) return;
    onUpdate(selectedInvoice.lotNo, { status: 'Invoiced', remarks: invoiceRemarks });
    alert(`Invoice finalized for ${selectedInvoice.lotNo}. Posted to accounts.`);
    setSelectedInvoice(null);
  };

  if (selectedInvoice) {
    const subtotal = calculateSubtotal(selectedInvoice.items);
    const gstAmount = useGST ? subtotal * 0.03 : 0;
    const grandTotal = subtotal + gstAmount;

    return (
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in slide-in-from-right duration-300">
        <button onClick={() => setSelectedInvoice(null)} className="flex items-center gap-2 text-slate-500 font-semibold hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to List
        </button>

        <div className="bg-white rounded-2xl border shadow-xl overflow-hidden print:shadow-none print:border-none">
          <header className="px-8 py-10 border-b bg-slate-50 flex justify-between items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-900 rounded-xl text-white">
                  <Receipt className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 tracking-tight">PURCHASE INVOICE</h2>
                  <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Section 6 : Final Settlement</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-8 pt-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Branch</p>
                  <p className="text-sm font-bold text-slate-900">{selectedInvoice.branch}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Invoice #</p>
                  <p className="text-sm font-bold text-slate-900">INV-{selectedInvoice.lotNo.split('-')[1]}</p>
                </div>
              </div>
            </div>
            <div className="text-right space-y-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Date</p>
                <p className="text-lg font-bold text-slate-900">{new Date().toLocaleDateString('en-GB')}</p>
              </div>
              <div className="pt-2">
                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Lot Reference</p>
                <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold">{selectedInvoice.lotNo}</span>
              </div>
            </div>
          </header>

          <div className="p-8 space-y-8">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
               <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <User className="w-4 h-4" /> Party Information
                </div>
                <span className="text-[10px] bg-slate-900 text-white px-2 py-0.5 rounded font-bold">AUTO FROM QUOTATION</span>
               </div>
               <div className="grid grid-cols-2 gap-12">
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">Party Name</p>
                    <p className="text-xl font-bold text-slate-900">{selectedInvoice.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">AADHAR / ID</p>
                    <p className="text-xl font-bold font-mono text-slate-700">{selectedInvoice.customerAadhar}</p>
                  </div>
               </div>
            </div>

            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b text-slate-400 text-[10px] uppercase font-bold tracking-widest">
                    <th className="px-4 py-3">SNo</th>
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Piece</th>
                    <th className="px-4 py-3">Weight</th>
                    <th className="px-4 py-3">Purity</th>
                    <th className="px-4 py-3">Waste %</th>
                    <th className="px-4 py-3">Net Weight</th>
                    <th className="px-4 py-3">Rate</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedInvoice.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-4">{item.sNo}</td>
                      <td className="px-4 py-4 font-bold text-slate-900">{item.product}</td>
                      <td className="px-4 py-4 font-medium">{item.piece}</td>
                      <td className="px-4 py-4 font-medium">{item.weight}g</td>
                      <td className="px-4 py-4 font-bold text-slate-500">{item.purity}</td>
                      <td className="px-4 py-4 text-slate-500">{item.wastePercent}%</td>
                      <td className="px-4 py-4 font-bold text-amber-700">{item.netWeight.toFixed(3)}g</td>
                      <td className="px-4 py-4 text-slate-600">₹ {item.rate?.toLocaleString()}</td>
                      <td className="px-4 py-4 text-right font-bold text-slate-900">₹ {item.amount?.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-bold border-t">
                  <tr>
                    <td colSpan={2} className="px-4 py-4 text-right text-slate-400 uppercase text-[10px]">Total</td>
                    <td className="px-4 py-4 text-slate-900">{calculateTotalPieces(selectedInvoice.items)}</td>
                    <td className="px-4 py-4 text-slate-900">{calculateTotalWeight(selectedInvoice.items).toFixed(3)}g</td>
                    <td colSpan={2}></td>
                    <td className="px-4 py-4 text-amber-700">{calculateTotalNetWeight(selectedInvoice.items).toFixed(3)}g</td>
                    <td></td>
                    <td className="px-4 py-4 text-right text-slate-900">₹ {subtotal.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-4">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Remarks :</label>
                  <textarea 
                    className="w-full border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-slate-900 outline-none h-24"
                    placeholder="Enter invoice remarks..."
                    value={invoiceRemarks}
                    onChange={(e) => setInvoiceRemarks(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                  <div 
                    onClick={() => setUseGST(!useGST)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${useGST ? 'bg-blue-600 border-blue-600' : 'bg-white border-blue-300'}`}
                  >
                    {useGST && <CheckCircle2 className="w-4 h-4 text-white" />}
                  </div>
                  <div>
                    <h5 className="font-bold text-blue-900 text-sm italic">GST? - YES (3%)</h5>
                    <p className="text-[10px] text-blue-700">Apply standard jewelry GST for legal procurement billing.</p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-2xl p-8 text-white space-y-4 shadow-xl">
                 <div className="flex justify-between text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                    <span>Taxable Amount</span>
                    <span>₹ {subtotal.toLocaleString()}</span>
                 </div>
                 {useGST && (
                   <div className="flex justify-between text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                      <span>GST (3%)</span>
                      <span>₹ {gstAmount.toLocaleString()}</span>
                   </div>
                 )}
                 <div className="pt-4 border-t border-slate-800 flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-1">Final Amount</p>
                      <p className="text-4xl font-black text-amber-500 tracking-tighter">₹ {grandTotal.toLocaleString()}</p>
                    </div>
                    <p className="text-[10px] text-slate-500 italic">Auth Signatory Required</p>
                 </div>
              </div>
            </div>
          </div>

          <footer className="px-8 py-6 bg-slate-50 border-t flex justify-between items-center print:hidden">
             <button className="flex items-center gap-2 text-slate-500 font-bold text-sm hover:text-slate-900 transition-all">
                <FileText className="w-4 h-4" /> Save as Draft
             </button>
             <div className="flex gap-4">
               <button className="flex items-center gap-2 border px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-white transition-all">
                  <Printer className="w-4 h-4" /> Print (Itemwise)
               </button>
               <button 
                  onClick={handleFinalizeInvoice}
                  className="flex items-center gap-2 bg-slate-900 text-white px-8 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
               >
                  <Receipt className="w-4 h-4" /> Finalize & Post to Accounts
               </button>
             </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
       <header>
          <h2 className="text-2xl font-bold text-slate-900">Purchase Invoice (Section 6)</h2>
          <p className="text-slate-500 text-sm">Convert approved lot quotations into final purchase invoices.</p>
       </header>

       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internalApprovedLots.map(lot => (
            <div key={lot.lotNo} className="bg-white border rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group border-slate-100">
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-slate-100 rounded-lg group-hover:bg-slate-900 group-hover:text-white transition-colors">
                  <Package className="w-5 h-5" />
                </div>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight">Approved by RH</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">{lot.lotNo}</h3>
              <p className="text-sm font-medium text-slate-500 mb-4">{lot.customerName}</p>
              <div className="space-y-2 border-t pt-4 border-slate-50">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-slate-400 uppercase tracking-widest text-[9px]">Quotation Val.</span>
                  <span className="text-slate-900">₹ {calculateSubtotal(lot.items).toLocaleString()}</span>
                </div>
                <button 
                  onClick={() => setSelectedInvoice(lot)}
                  className="w-full mt-4 bg-slate-900 text-white font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-100 transition-all"
                >
                  Generate Invoice <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {internalApprovedLots.length === 0 && (
            <div className="col-span-full py-20 bg-slate-50 rounded-2xl border border-dashed flex flex-col items-center justify-center text-slate-400">
                <AlertCircle className="w-12 h-12 mb-2 opacity-20" />
                <p className="font-bold uppercase tracking-widest text-xs">No Approved Lots Found</p>
            </div>
          )}
       </div>
    </div>
  );
};

export default PurchaseInvoice;
