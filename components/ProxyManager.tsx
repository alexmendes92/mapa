import React, { useState, useEffect } from 'react';
import { proxyService } from '../services/api';
import { Shield, Save } from 'lucide-react';
import { ProxyConfig } from '../types';

interface ProxyManagerProps {
  selectedInstance: string | null;
}

const ProxyManager: React.FC<ProxyManagerProps> = ({ selectedInstance }) => {
  const [proxy, setProxy] = useState<ProxyConfig>({
    enabled: false,
    host: '',
    port: '',
    protocol: 'http',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedInstance) {
      setLoading(true);
      proxyService.find(selectedInstance)
        .then((data: any) => {
           if (data) setProxy(data);
        })
        .catch(() => {}) // Ignore error if no proxy set
        .finally(() => setLoading(false));
    }
  }, [selectedInstance]);

  const handleSave = async () => {
    if (!selectedInstance) return;
    try {
      await proxyService.set(selectedInstance, proxy);
      alert('Proxy saved successfully');
    } catch (error) {
      alert('Error saving proxy');
    }
  };

  if (!selectedInstance) return <div className="text-center text-slate-500 mt-20">Select an instance to configure proxy.</div>;

  return (
    <div className="max-w-2xl mx-auto bg-card p-6 rounded-lg border border-slate-700">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Shield className="text-primary" /> Proxy Configuration
      </h2>
      
      <div className="space-y-4">
         <div className="flex items-center gap-2 mb-4">
            <input 
              type="checkbox"
              checked={proxy.enabled}
              onChange={e => setProxy({...proxy, enabled: e.target.checked})}
              className="w-5 h-5 accent-primary"
            />
            <span className="text-white">Enable Proxy</span>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="block text-slate-400 text-sm mb-1">Protocol</label>
               <select 
                 value={proxy.protocol} 
                 onChange={e => setProxy({...proxy, protocol: e.target.value})}
                 className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white"
               >
                 <option value="http">HTTP</option>
                 <option value="https">HTTPS</option>
               </select>
            </div>
            <div>
               <label className="block text-slate-400 text-sm mb-1">Host / IP</label>
               <input 
                 value={proxy.host}
                 onChange={e => setProxy({...proxy, host: e.target.value})}
                 className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white"
                 placeholder="127.0.0.1"
               />
            </div>
            <div>
               <label className="block text-slate-400 text-sm mb-1">Port</label>
               <input 
                 value={proxy.port}
                 onChange={e => setProxy({...proxy, port: e.target.value})}
                 className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white"
                 placeholder="8080"
               />
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4 border-t border-slate-700 pt-4">
             <div>
               <label className="block text-slate-400 text-sm mb-1">Username (Optional)</label>
               <input 
                 value={proxy.username}
                 onChange={e => setProxy({...proxy, username: e.target.value})}
                 className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white"
               />
            </div>
            <div>
               <label className="block text-slate-400 text-sm mb-1">Password (Optional)</label>
               <input 
                 type="password"
                 value={proxy.password}
                 onChange={e => setProxy({...proxy, password: e.target.value})}
                 className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white"
               />
            </div>
         </div>

         <button 
           onClick={handleSave}
           disabled={loading}
           className="w-full bg-primary hover:bg-emerald-600 text-darker font-bold py-3 rounded mt-4 flex items-center justify-center gap-2"
         >
           <Save size={18} /> Save Proxy Settings
         </button>
      </div>
    </div>
  );
};

export default ProxyManager;
