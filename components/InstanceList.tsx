import React, { useState } from 'react';
import { instanceService } from '../services/api';
import { Plus, Trash2, LogOut, RefreshCw, QrCode, Smartphone, Settings, Activity, CheckCircle, XCircle } from 'lucide-react';

interface InstanceListProps {
  instances: any[];
  refreshInstances: () => void;
  isLoading: boolean;
}

const InstanceList: React.FC<InstanceListProps> = ({ instances, refreshInstances, isLoading }) => {
  const [newInstanceName, setNewInstanceName] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [connectedInstance, setConnectedInstance] = useState<string | null>(null);
  
  // Management Modal State
  const [managingInstance, setManagingInstance] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [presence, setPresence] = useState('available');

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

  const checkConnectionState = async (name: string) => {
      try {
          const data = await instanceService.connectionState(name);
          setConnectionStatus(data);
      } catch (error) {
          setConnectionStatus({ error: 'Failed to fetch status' });
      }
  };

  const handleSetPresence = async (name: string) => {
      try {
          await instanceService.setPresence(name, presence as any);
          alert('Presence updated');
      } catch (error) {
          alert('Failed to set presence');
      }
  };

  const openManageModal = (name: string) => {
      setManagingInstance(name);
      setConnectionStatus(null);
      setPresence('available');
      // Auto fetch status
      checkConnectionState(name);
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
        {isLoading ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500">
                <RefreshCw className="animate-spin mb-4 text-primary" size={40} />
                <p>Loading instances...</p>
            </div>
        ) : instances.length === 0 ? (
            <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-lg">
                <Smartphone size={48} className="mb-4 opacity-50" />
                <p>No instances found.</p>
                <p className="text-sm">Create a new one above to get started.</p>
            </div>
        ) : (
            instances.map((item: any) => {
            const inst = item.instance || item; // Handle structure variations
            
            if (!inst || !inst.instanceName) return null;

            const name = inst.instanceName;
            const status = inst.status;

            return (
                <div key={name} className="bg-card p-6 rounded-lg border border-slate-700 shadow-lg flex flex-col justify-between hover:border-primary/50 transition-colors">
                <div>
                    <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold text-white truncate" title={name}>{name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${status === 'open' || status === 'connected' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {status || 'Unknown'}
                    </span>
                    </div>
                    <div className="text-sm text-slate-400 mb-4 space-y-1">
                        <p className="flex justify-between"><span>Profile:</span> <span className="text-white">{inst.profileName || 'N/A'}</span></p>
                        <p className="flex justify-between"><span>Number:</span> <span className="text-white">{inst.owner ? inst.owner.split('@')[0] : 'N/A'}</span></p>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-slate-700">
                    <button onClick={() => handleConnect(name)} className="p-2 bg-blue-600/20 text-blue-500 rounded hover:bg-blue-600/30 transition-colors" title="Connect / QR">
                        <QrCode size={18} />
                    </button>
                    <button onClick={() => openManageModal(name)} className="p-2 bg-slate-600/20 text-slate-400 rounded hover:bg-slate-600/30 transition-colors" title="Manage Instance">
                        <Settings size={18} />
                    </button>
                    <button onClick={() => instanceService.restart(name)} className="p-2 bg-purple-600/20 text-purple-500 rounded hover:bg-purple-600/30 transition-colors" title="Restart">
                        <RefreshCw size={18} />
                    </button>
                    <button onClick={() => handleLogout(name)} className="p-2 bg-yellow-600/20 text-yellow-500 rounded hover:bg-yellow-600/30 transition-colors" title="Logout">
                        <LogOut size={18} />
                    </button>
                    <button onClick={() => handleDelete(name)} className="p-2 bg-red-600/20 text-red-500 rounded hover:bg-red-600/30 ml-auto transition-colors" title="Delete">
                        <Trash2 size={18} />
                    </button>
                </div>
                </div>
            );
            })
        )}
      </div>

      {/* QR Code Modal */}
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
            <div className="flex justify-center bg-white">
                <img src={qrCode} alt="QR Code" className="w-64 h-64 object-contain" />
            </div>
            <p className="text-center text-gray-500 text-sm mt-4">Open WhatsApp &gt; Linked Devices &gt; Link a Device</p>
          </div>
        </div>
      )}

      {/* Management Modal */}
      {managingInstance && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
              <div className="bg-card border border-slate-600 p-6 rounded-lg max-w-md w-full relative text-white">
                  <button 
                    onClick={() => setManagingInstance(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                  >
                    <XCircle size={24} />
                  </button>
                  
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                      <Settings className="text-primary" /> Manage {managingInstance}
                  </h3>

                  {/* Connection Status */}
                  <div className="mb-6 p-4 bg-dark rounded border border-slate-700">
                      <div className="flex justify-between items-center mb-2">
                          <h4 className="font-bold text-sm text-slate-300 flex items-center gap-2">
                              <Activity size={16} /> Connection State
                          </h4>
                          <button onClick={() => checkConnectionState(managingInstance)} className="text-xs text-primary hover:underline">Refresh</button>
                      </div>
                      <div className="font-mono text-xs text-green-400 min-h-[40px] flex items-center">
                          {connectionStatus ? (
                              connectionStatus.instance ? (
                                  <div className="flex flex-col gap-1">
                                      <span>State: {connectionStatus.instance.state}</span>
                                      <span>Status: {connectionStatus.instance.status}</span>
                                  </div>
                              ) : JSON.stringify(connectionStatus)
                          ) : (
                              <span className="text-slate-500 italic">Checking...</span>
                          )}
                      </div>
                  </div>

                  {/* Set Presence */}
                  <div className="mb-4">
                      <label className="block text-slate-400 text-sm mb-2">Set Presence</label>
                      <div className="flex gap-2">
                          <select 
                              value={presence}
                              onChange={(e) => setPresence(e.target.value)}
                              className="flex-1 bg-dark border border-slate-600 rounded px-3 py-2 text-white outline-none"
                          >
                              <option value="available">Available</option>
                              <option value="unavailable">Unavailable</option>
                              <option value="composing">Composing</option>
                              <option value="recording">Recording</option>
                              <option value="paused">Paused</option>
                          </select>
                          <button 
                              onClick={() => handleSetPresence(managingInstance)}
                              className="bg-blue-600 hover:bg-blue-700 px-4 rounded font-bold text-sm"
                          >
                              Set
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default InstanceList;