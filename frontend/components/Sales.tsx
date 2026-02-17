
import React, { useState, useMemo } from 'react';
import { 
  BadgeDollarSign, 
  Search, 
  ChevronRight, 
  FileCheck,
  Building,
  Package,
  Loader2,
  ShoppingCart,
  Plus,
  X,
  ClipboardList,
  ArrowLeft,
  CheckSquare,
  Square
} from 'lucide-react';
import { TransactionData, SalesOrder, SalesOrderItem } from '../types';

interface SalesProps {
  processedLots: TransactionData[];
  orders: SalesOrder[];
  onUpdateOrders: (order: SalesOrder) => void;
  goldRate: number;
  silverRate: number;
}

const Sales: React.FC<SalesProps> = ({ processedLots, orders, onUpdateOrders, goldRate, silverRate }) => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [selectedBar, setSelectedBar] = useState<TransactionData | null>(null);
  const [isSelling, setIsSelling] = useState(false);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [newOrder, setNewOrder] = useState<Partial<SalesOrder>>({
    buyerName: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Confirmed',
    items: []
  });

  const inventory = useMemo(() => {
    return processedLots.reduce((acc, lot) => {
      lot.items.forEach(item => {
        const metal = item.product.toLowerCase().includes('silver') ? 'silver' : 'gold';
        acc[metal] += item.weight;
      });
      return acc;
    }, { gold: 0, silver: 0 });
  }, [processedLots]);

  const addOrderItem = () => {
    const items = [...(newOrder.items || [])];
    const metalType = selectedBar?.items[0]?.product.toLowerCase().includes('silver') ? 'Silver' : 'Gold';
    const rate = metalType === 'Gold' ? goldRate : silverRate;
    const weight = selectedBar?.items.reduce((s,i) => s + i.weight, 0) || 0;
    
    items.push({ 
      id: Math.random().toString(), 
      product: `${metalType} Bar (Ref: ${selectedBar?.lotNo})`, 
      quantity: weight, 
      price: rate, 
      total: weight * rate 
    });
    setNewOrder({ ...newOrder, items });
  };

  const handleSaveOrder = async () => {
    if (!newOrder.buyerName || !newOrder.items?.length) return;
    const total = newOrder.items.reduce((sum, i) => sum + i.total, 0);
    const order: SalesOrder = {
      id: 'SO-' + Math.floor(Math.random() * 90000 + 10000),
      buyerName: newOrder.buyerName,
      date: newOrder.date!,
      status: 'Confirmed',
      items: newOrder.items as SalesOrderItem[],
      totalAmount: total
    };
    onUpdateOrders(order);
    setIsCreatingOrder(false);
  };

  const startSaleFromBar = (bar: TransactionData) => {
    setSelectedBar(bar);
    setNewOrder({
      ...newOrder,
      items: [{
        id: '1',
        product: `Refined Bar: ${bar.lotNo}`,
        quantity: bar.items.reduce((s,i) => s + i.weight, 0),
        price: bar.items[0]?.product.toLowerCase().includes('silver') ? silverRate : goldRate,
        total: bar.items.reduce((s,i) => s + i.weight, 0) * (bar.items[0]?.product.toLowerCase().includes('silver') ? silverRate : goldRate)
      }]
    });
    setIsCreatingOrder(true);
  };

  if (isCreatingOrder) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom duration-500">
        <button onClick={() => setIsCreatingOrder(false)} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900"><ArrowLeft className="w-4 h-4" /> Back</button>
        <div className="bg-white rounded-[2.5rem] border shadow-2xl overflow-hidden">
          <header className="px-10 py-8 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-4"><ShoppingCart className="w-8 h-8 text-amber-500" /><div><h2 className="text-xl font-black uppercase">Create Sales Contract</h2></div></div>
            <div className="text-right"><p className="text-[10px] text-slate-400 font-black uppercase">Contract Value</p><p className="text-3xl font-black text-amber-500">₹ {(newOrder.items || []).reduce((s,i) => s + i.total, 0).toLocaleString()}</p></div>
          </header>
          <div className="p-10 space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <input className="w-full bg-slate-50 border rounded-2xl px-6 py-4 text-sm font-bold outline-none" placeholder="Buyer Name" value={newOrder.buyerName} onChange={e => setNewOrder({...newOrder, buyerName: e.target.value})} />
              <input className="w-full bg-slate-50 border rounded-2xl px-6 py-4 text-sm font-bold outline-none" type="date" value={newOrder.date} onChange={e => setNewOrder({...newOrder, date: e.target.value})} />
            </div>
            <div className="space-y-3">
              {(newOrder.items || []).map((item) => (
                <div key={item.id} className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border">
                  <span className="flex-1 font-bold text-sm">{item.product}</span>
                  <span className="w-24 text-xs font-bold">{item.quantity}g</span>
                  <span className="w-32 text-xs font-bold text-slate-400">@ ₹{item.price.toLocaleString()}</span>
                  <span className="w-40 text-right font-black text-slate-900">₹ {item.total.toLocaleString()}</span>
                </div>
              ))}
            </div>
            <button onClick={handleSaveOrder} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl">Authorize Sales Contract</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-end">
        <div><h2 className="text-2xl font-bold text-slate-900">Corporate Sales & Liquidation</h2><p className="text-slate-500 text-sm">Institutional trade desk and refined inventory management.</p></div>
        <div className="flex bg-white border rounded-2xl p-1 shadow-sm"><button onClick={() => setActiveTab('inventory')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'inventory' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Inventory</button><button onClick={() => setActiveTab('orders')} className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'orders' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-400'}`}>Contracts</button></div>
      </header>

      {activeTab === 'inventory' ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-2xl p-6 shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase mb-2">Gold Reserve</p><p className="text-2xl font-black text-slate-900">{inventory.gold.toFixed(3)} g</p></div>
            <div className="bg-white border rounded-2xl p-6 shadow-sm"><p className="text-[10px] font-black text-slate-400 uppercase mb-2">Silver Reserve</p><p className="text-2xl font-black text-slate-900">{inventory.silver.toFixed(3)} g</p></div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 shadow-sm"><p className="text-[10px] font-black text-emerald-600 uppercase mb-2">Market Valuation</p><p className="text-2xl font-black text-emerald-700">₹ {(inventory.gold * goldRate + inventory.silver * silverRate).toLocaleString()}</p></div>
          </div>
          <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-slate-50 flex justify-between items-center"><h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Available Bars for Liquidation</h3></div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/30 border-b text-[10px] font-black text-slate-400 uppercase"><tr><th className="px-8 py-5">Bar Reference</th><th className="px-8 py-5">Weight</th><th className="px-8 py-5 text-right">Action</th></tr></thead>
              <tbody className="divide-y">
                {processedLots.map(lot => (
                  <tr key={lot.lotNo} className="hover:bg-slate-50">
                    <td className="px-8 py-6"><div><p className="font-black text-slate-900">{lot.lotNo}</p><p className="text-[9px] text-slate-400 uppercase">Refined 999 Pure</p></div></td>
                    <td className="px-8 py-6 font-black">{lot.items.reduce((s,i)=>s+i.weight,0).toFixed(3)} g</td>
                    <td className="px-8 py-6 text-right"><button onClick={() => startSaleFromBar(lot)} className="bg-slate-900 text-white px-5 py-2 rounded-xl text-[10px] font-black uppercase">Sell Bar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="bg-white rounded-[2rem] border shadow-sm overflow-hidden">
            <div className="p-6 border-b bg-slate-50"><h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em]">Institutional Contract History</h3></div>
            <table className="w-full text-left text-sm">
              <thead><tr className="bg-slate-50/30 border-b text-[10px] font-black text-slate-400 uppercase tracking-widest"><th className="px-8 py-5">Contract ID</th><th className="px-8 py-5">Buyer</th><th className="px-8 py-5">Date</th><th className="px-8 py-5 text-right">Valuation</th></tr></thead>
              <tbody className="divide-y">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-8 py-6 font-black">{order.id}</td>
                    <td className="px-8 py-6 font-bold text-slate-600">{order.buyerName}</td>
                    <td className="px-8 py-6 text-xs text-slate-400 font-bold">{order.date}</td>
                    <td className="px-8 py-6 text-right font-black text-slate-900">₹ {order.totalAmount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sales;
