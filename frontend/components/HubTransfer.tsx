
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { 
  ArrowRightLeft, 
  Truck, 
  Package, 
  ShieldCheck, 
  MapPin, 
  User, 
  CheckCircle2, 
  ClipboardCheck,
  Search,
  ArrowRight,
  FileUp,
  Download,
  AlertCircle,
  X,
  FileText,
  Filter
} from 'lucide-react';
import { TransactionData } from '../types';

interface BulkDispatchData {
  lotNo: string;
  vehicleNo: string;
  driverName: string;
  sealNumber: string;
}

// Added Props interface to handle readyForTransfer and onUpdate passed from App.tsx
interface HubTransferProps {
  readyForTransfer: TransactionData[];
  onUpdate: (lotNo: string, updates: Partial<TransactionData>) => void;
}

const HubTransfer: React.FC<HubTransferProps> = ({ readyForTransfer: propReady, onUpdate }) => {
  const [selectedLots, setSelectedLots] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bulkMode, setBulkMode] = useState(false);
  const [bulkMappings, setBulkMappings] = useState<Record<string, BulkDispatchData>>({});
  const [transitDetails, setTransitDetails] = useState({
    vehicleNo: '',
    driverName: '',
    sealNumber: '',
    hubId: 'HUB-ERODE-01'
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Use props if available, otherwise fallback to local mock data
  const [internalReady, setInternalReady] = useState<TransactionData[]>([]);

  useEffect(() => {
    if (propReady && propReady.length > 0) {
      setInternalReady(propReady);
    } else {
      // Mock Data fallback
      setInternalReady([
        {
          branch: 'Salem West',
          refNo: 'REF-9011',
          lotNo: 'LOT-3321',
          date: '2025-02-24',
          customerAadhar: '1122-3344-5566',
          customerName: 'Anitha S.',
          status: 'Paid',
          items: [{ sNo: 1, product: 'Silver Anklet', piece: 2, weight: 150.0, purity: '750', wastePercent: 5, netWeight: 142.5, rate: 95, amount: 13537.5 }]
        }
      ]);
    }
  }, [propReady]);

  const filteredLots = useMemo(() => {
    return internalReady.filter(lot => 
      lot.lotNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.customerName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, internalReady]);

  const toggleLot = (lotNo: string) => {
    setSelectedLots(prev => 
      prev.includes(lotNo) ? prev.filter(id => id !== lotNo) : [...prev, lotNo]
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').map(row => row.split(','));
      
      // Basic CSV Parser: LotNo, VehicleNo, DriverName, SealNo
      const newMappings: Record<string, BulkDispatchData> = {};
      const newSelected: string[] = [...selectedLots];

      // Skip header row
      for (let i = 1; i < rows.length; i++) {
        const [lotNo, vehicleNo, driverName, sealNo] = rows[i].map(s => s?.trim());
        if (lotNo && internalReady.some(l => l.lotNo === lotNo)) {
          newMappings[lotNo] = {
            lotNo,
            vehicleNo: vehicleNo || '',
            driverName: driverName || '',
            sealNumber: sealNo || ''
          };
          if (!newSelected.includes(lotNo)) {
            newSelected.push(lotNo);
          }
        }
      }

      setBulkMappings(newMappings);
      setSelectedLots(newSelected);
      setBulkMode(true);
      alert(`${Object.keys(newMappings).length} lots mapped from CSV successfully.`);
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const downloadTemplate = () => {
    const csvContent = "data:text/csv;charset=utf-8,Lot No,Vehicle No,Driver Name,Seal Number\nLOT-3321,TN 33 XX 1234,Ramesh,SEAL-998\nLOT-3322,TN 33 YY 5678,Suresh,SEAL-999";
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hub_transfer_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTransferInit = () => {
    if (selectedLots.length === 0) return alert("Select at least one lot to transfer.");
    
    // Validate if all selected lots have data (either manual or bulk)
    const isValid = selectedLots.every(lotNo => {
      if (bulkMode && bulkMappings[lotNo]) {
        return bulkMappings[lotNo].vehicleNo && bulkMappings[lotNo].sealNumber;
      }
      return transitDetails.vehicleNo && transitDetails.sealNumber;
    });

    if (!isValid) return alert("Some lots are missing mandatory Vehicle No or Seal No.");
    
    // Call parent update for each selected lot
    selectedLots.forEach(lotNo => {
      onUpdate(lotNo, { status: 'In Transit' });
    });

    alert(`Transfer of ${selectedLots.length} lots initiated to Hub. Dispatch ID: TRN-${Math.floor(Math.random()*1000)}`);
    setSelectedLots([]);
    setBulkMappings({});
    setBulkMode(false);
  };

  const clearBulkData = () => {
    setBulkMappings({});
    setBulkMode(false);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Hub Transfer Management</h2>
          <p className="text-slate-500 text-sm">Organize secure movement of precious metal lots to the central Hub.</p>
        </div>
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-xl border border-slate-200 font-bold text-xs uppercase hover:bg-slate-50 transition-colors shadow-sm"
          >
            <FileUp className="w-4 h-4 text-blue-600" /> Bulk Dispatch Upload
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept=".csv" 
            className="hidden" 
          />
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl border border-blue-100 font-bold text-xs uppercase">
            <Truck className="w-4 h-4" /> Logistics Active
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Selectable Lots */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
            <div className="p-4 border-b bg-slate-50 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" /> Available for Dispatch
                </h3>
                <div className="flex items-center gap-4">
                   <button onClick={downloadTemplate} className="text-[10px] font-bold text-blue-600 flex items-center gap-1 hover:underline uppercase">
                      <Download className="w-3 h-3" /> Get CSV Template
                   </button>
                   <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Total: {internalReady.length} Lots</div>
                </div>
              </div>
              
              <div className="relative group">
                <input 
                  type="text"
                  placeholder="Filter by Lot ID or Customer Name..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                {searchTerm && (
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
              {filteredLots.length > 0 ? (
                filteredLots.map(lot => {
                  const isBulkMapped = bulkMappings[lot.lotNo];
                  return (
                    <div 
                      key={lot.lotNo} 
                      onClick={() => toggleLot(lot.lotNo)}
                      className={`p-6 flex items-center justify-between cursor-pointer transition-all hover:bg-slate-50/80 ${selectedLots.includes(lot.lotNo) ? 'bg-blue-50 border-l-4 border-blue-600' : ''}`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${selectedLots.includes(lot.lotNo) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300'}`}>
                          {selectedLots.includes(lot.lotNo) && <CheckCircle2 className="w-4 h-4 text-white" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900">{lot.lotNo}</h4>
                            {isBulkMapped && (
                              <span className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-tighter">
                                <FileText className="w-2.5 h-2.5" /> CSV Data Ready
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-500">{lot.customerName} • {lot.branch}</p>
                        </div>
                      </div>
                      <div className="text-right flex items-center gap-6">
                        {isBulkMapped && (
                          <div className="hidden md:block text-left text-[10px] border-l pl-4 border-blue-200">
                            <p className="font-bold text-blue-800">{isBulkMapped.vehicleNo}</p>
                            <p className="text-blue-600 uppercase tracking-tight">{isBulkMapped.driverName}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-slate-900">{lot.items.reduce((s,i)=>s+i.weight,0).toFixed(3)}g</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">{lot.status}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-20 flex flex-col items-center justify-center text-slate-400">
                   <Filter className="w-12 h-12 mb-2 opacity-10" />
                   <p className="text-sm font-medium">No lots found matching "{searchTerm}"</p>
                </div>
              )}
            </div>
          </div>

          {bulkMode && (
             <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                   <AlertCircle className="w-5 h-5 text-amber-600" />
                   <div className="text-xs">
                      <p className="font-bold text-amber-900 uppercase tracking-wide">Bulk Upload Active</p>
                      <p className="text-amber-700">Dispatch details are currently being derived from the uploaded file.</p>
                   </div>
                </div>
                <button 
                  onClick={clearBulkData}
                  className="flex items-center gap-1 text-[10px] font-bold text-amber-800 hover:text-red-700 uppercase"
                >
                   <X className="w-3 h-3" /> Clear Uploaded Data
                </button>
             </div>
          )}
        </div>

        {/* Right Side: Dispatch Details */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl space-y-6 sticky top-24">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <ClipboardCheck className="w-6 h-6 text-blue-400" />
                <h3 className="text-lg font-bold">Dispatch Summary</h3>
              </div>
              {bulkMode && <span className="text-[10px] font-bold bg-blue-600/30 text-blue-400 px-2 py-1 rounded">BULK ON</span>}
            </div>
            
            <div className="space-y-4">
               <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Assign Destination Hub</label>
                  <select className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-white appearance-none">
                    <option value="HUB-ERODE-01">Erode Central Hub</option>
                    <option value="HUB-SALEM-02">Salem North Hub</option>
                  </select>
               </div>
               
               {!bulkMode ? (
                 <div className="grid grid-cols-1 gap-4 animate-in fade-in duration-300">
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Vehicle Number</label>
                       <input 
                         type="text" 
                         className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500" 
                         placeholder="TN 33 XX 1234"
                         value={transitDetails.vehicleNo}
                         onChange={(e)=>setTransitDetails({...transitDetails, vehicleNo: e.target.value})}
                       />
                    </div>
                    <div>
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Security Seal Number</label>
                       <input 
                         type="text" 
                         className="w-full bg-slate-800 border-slate-700 rounded-xl px-4 py-3 text-sm text-white outline-none focus:ring-2 focus:ring-blue-500" 
                         placeholder="SEAL-00982"
                         value={transitDetails.sealNumber}
                         onChange={(e)=>setTransitDetails({...transitDetails, sealNumber: e.target.value})}
                       />
                    </div>
                 </div>
               ) : (
                 <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-700 animate-in slide-in-from-right-4 duration-300">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest mb-3 text-center border-b border-slate-700 pb-2">Bulk Mapping Statistics</p>
                    <div className="space-y-3 pt-2">
                       <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Matched via CSV</span>
                          <span className="font-bold text-blue-400">{Object.keys(bulkMappings).length}</span>
                       </div>
                       <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Unmapped (Manual)</span>
                          <span className="font-bold text-amber-500">{selectedLots.filter(l => !bulkMappings[l]).length}</span>
                       </div>
                    </div>
                 </div>
               )}
            </div>

            <div className="pt-4 space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Lots Selected</span>
                <span className="font-bold">{selectedLots.length}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Transit Insurance</span>
                <span className="text-green-400 font-bold uppercase tracking-widest text-[10px]">Active</span>
              </div>
            </div>

            <button 
              onClick={handleTransferInit}
              disabled={selectedLots.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 ${selectedLots.length > 0 ? 'bg-blue-600 hover:bg-blue-500' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
            >
              Initiate Secure Transfer <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HubTransfer;
