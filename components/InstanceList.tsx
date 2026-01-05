import React, { useState } from 'react';
import { instanceService } from '../services/api';
import { Plus, Trash2, LogOut, RefreshCw, QrCode } from 'lucide-react';

interface InstanceListProps {
  instances: any[];
  refreshInstances: () => void;
}

const InstanceList: React.FC<InstanceListProps> = ({ instances, refreshInstances }) => {
  const [newInstanceName, setNewInstanceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectedInstance, setConnectedInstance] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newInstanceName) return;
    setLoading(true);
    try {
      await instanceService.create(newInstanceName);
      setNewInstanceName('');
      refreshInstances();
    } catch (error) {
      alert('Failed to create instance');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (name: string) => {
    setLoading(true);
    setQrCode(null);
    setConnectedInstance(name);
    try {
      const data: any = await instanceService.connect(name);
      if (data.base64 || (data.qrcode && data.qrcode.base64)) {
        setQrCode(data.base64 || data.qrcode.base64);
      } else {
        alert('Instance likely already connected or no QR returned.');
      }
    } catch (error) {
      alert('Error connecting instance');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await instanceService.delete(name);
      refreshInstances();
    } catch (error) {
      alert('Failed to delete');
    }
  };

  const handleLogout = async (name: string) => {
    if (!confirm(`Logout ${name}?`)) return;
    try {
      await instanceService.logout(name);
      refreshInstances();
    } catch (error) {
      alert('Failed to logout');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-card p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold mb-4">Create New Instance</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Instance Name"
            value={newInstanceName}
            onChange={(e) => setNewInstanceName(e.target.value)}
            className="flex-1 bg-dark border border-slate-600 rounded px-4 py-2 text-white focus:border-primary outline-none"
          />
          <button
            onClick={handleCreate}
            disabled={loading || !newInstanceName}
            className="bg-primary hover:bg-emerald-600 text-darker font-bold px-6 py-2 rounded flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            <Plus size={18} />
            Create
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {instances.map((item: any) => {
           const inst = item.instance || item; // Handle structure variations
           
           if (!inst || !inst.instanceName) return null;

           const name = inst.instanceName;
           const status = inst.status;

           return (
            <div key={name} className="bg-card p-6 rounded-lg border border-slate-700 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-bold text-white">{name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${status === 'open' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {status || 'Unknown'}
                  </span>
                </div>
                <div className="text-sm text-slate-400 mb-4">
                  <p>Profile: {inst.profileName || 'N/A'}</p>
                  <p>Number: {inst.owner || 'N/A'}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-700">
                <button onClick={() => handleConnect(name)} className="p-2 bg-blue-600/20 text-blue-500 rounded hover:bg-blue-600/30" title="Connect / QR">
                  <QrCode size={18} />
                </button>
                <button onClick={() => handleLogout(name)} className="p-2 bg-yellow-600/20 text-yellow-500 rounded hover:bg-yellow-600/30" title="Logout">
                  <LogOut size={18} />
                </button>
                <button onClick={() => instanceService.restart(name)} className="p-2 bg-purple-600/20 text-purple-500 rounded hover:bg-purple-600/30" title="Restart">
                  <RefreshCw size={18} />
                </button>
                <button onClick={() => handleDelete(name)} className="p-2 bg-red-600/20 text-red-500 rounded hover:bg-red-600/30 ml-auto" title="Delete">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
           );
        })}
      </div>

      {qrCode && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full relative">
            <button 
              onClick={() => setQrCode(null)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h3 className="text-center text-gray-800 font-bold mb-4 text-lg">Scan QR Code for {connectedInstance}</h3>
            <img src={qrCode} alt="QR Code" className="w-full h-auto" />
            <p className="text-center text-gray-500 text-sm mt-4">Open WhatsApp &gt; Linked Devices &gt; Link a Device</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstanceList;