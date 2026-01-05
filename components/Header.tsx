import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

interface HeaderProps {
  instances: any[];
  selectedInstance: string | null;
  setSelectedInstance: (name: string) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

const Header: React.FC<HeaderProps> = ({ instances, selectedInstance, setSelectedInstance, onRefresh, isLoading }) => {
  return (
    <header className="h-16 bg-card border-b border-slate-700 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <span className="text-slate-400 text-sm font-medium uppercase tracking-wider">Active Instance:</span>
        <select 
          value={selectedInstance || ''}
          onChange={(e) => setSelectedInstance(e.target.value)}
          className="bg-dark border border-slate-600 rounded px-3 py-1 text-white focus:ring-2 focus:ring-primary outline-none min-w-[200px]"
        >
          <option value="" disabled>Select an instance</option>
          {instances.map((item: any) => {
            // Handle both { instance: {...} } and flat {...} structures
            const inst = item.instance || item;
            // Support both v1 (instanceName) and v2 (name) fields
            const name = inst.instanceName || inst.name;
            
            if (!inst || !name) return null;

            return (
              <option key={name} value={name}>
                {name}
              </option>
            );
          })}
        </select>
        <button 
          onClick={onRefresh}
          disabled={isLoading}
          className="text-xs text-primary hover:text-primary/80 underline flex items-center gap-1 disabled:opacity-50"
        >
          <RefreshCw size={12} className={isLoading ? 'animate-spin' : ''} />
          {isLoading ? 'Refreshing...' : 'Refresh List'}
        </button>
      </div>

      <div className="flex items-center gap-4">
         {selectedInstance ? (
           <div className="flex items-center gap-2 text-green-500 bg-green-500/10 px-3 py-1 rounded-full text-xs font-bold border border-green-500/20">
             <Wifi size={14} />
             <span>CONNECTED</span>
           </div>
         ) : (
            <div className="flex items-center gap-2 text-slate-500 bg-slate-500/10 px-3 py-1 rounded-full text-xs font-bold border border-slate-500/20">
              <WifiOff size={14} />
              <span>NO INSTANCE SELECTED</span>
            </div>
         )}
      </div>
    </header>
  );
};

export default Header;