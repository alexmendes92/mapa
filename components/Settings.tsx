import React, { useState, useEffect } from 'react';
import { settingsService, chatService } from '../services/api';
import { Settings as SettingsIcon, User, Save, RefreshCw } from 'lucide-react';

interface SettingsProps {
  selectedInstance: string | null;
}

const Settings: React.FC<SettingsProps> = ({ selectedInstance }) => {
  const [loading, setLoading] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileStatus, setProfileStatus] = useState('');
  
  const [settings, setSettings] = useState({
    reject_call: false,
    always_online: false,
    read_messages: false,
    read_status: false,
  });

  const fetchSettings = async () => {
    if (!selectedInstance) return;
    setLoading(true);
    try {
      const data: any = await settingsService.find(selectedInstance);
      if (data) {
        setSettings({
          reject_call: data.reject_call || false,
          always_online: data.always_online || false,
          read_messages: data.read_messages || false,
          read_status: data.read_status || false,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [selectedInstance]);

  const handleSaveSettings = async () => {
    if (!selectedInstance) return;
    try {
      await settingsService.set(selectedInstance, settings);
      alert('Settings saved successfully!');
    } catch (error) {
      alert('Error saving settings.');
    }
  };

  const handleUpdateProfile = async (type: 'name' | 'status') => {
    if (!selectedInstance) return;
    try {
      if (type === 'name') {
        await chatService.updateName(selectedInstance, profileName);
      } else {
        await chatService.updateStatus(selectedInstance, profileStatus);
      }
      alert(`Profile ${type} updated!`);
    } catch (error) {
      alert(`Error updating ${type}`);
    }
  };

  if (!selectedInstance) return <div className="text-center text-slate-500 mt-20">Select an instance to configure settings.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Instance Behavior Settings */}
      <div className="bg-card p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <SettingsIcon className="text-primary" />
          Instance Behavior
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-dark rounded border border-slate-600">
            <span className="text-white font-medium">Reject Calls</span>
            <input 
              type="checkbox" 
              checked={settings.reject_call}
              onChange={e => setSettings({...settings, reject_call: e.target.checked})}
              className="w-5 h-5 accent-primary cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-dark rounded border border-slate-600">
            <span className="text-white font-medium">Always Online</span>
            <input 
              type="checkbox" 
              checked={settings.always_online}
              onChange={e => setSettings({...settings, always_online: e.target.checked})}
              className="w-5 h-5 accent-primary cursor-pointer"
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-dark rounded border border-slate-600">
            <span className="text-white font-medium">Read Messages Automatically</span>
            <input 
              type="checkbox" 
              checked={settings.read_messages}
              onChange={e => setSettings({...settings, read_messages: e.target.checked})}
              className="w-5 h-5 accent-primary cursor-pointer"
            />
          </div>
           <div className="flex items-center justify-between p-3 bg-dark rounded border border-slate-600">
            <span className="text-white font-medium">Read Status Automatically</span>
            <input 
              type="checkbox" 
              checked={settings.read_status}
              onChange={e => setSettings({...settings, read_status: e.target.checked})}
              className="w-5 h-5 accent-primary cursor-pointer"
            />
          </div>

          <div className="flex gap-2 mt-4">
            <button 
              onClick={handleSaveSettings}
              className="flex-1 bg-primary hover:bg-emerald-600 text-darker font-bold py-2 rounded flex items-center justify-center gap-2"
            >
              <Save size={18} /> Save Settings
            </button>
            <button 
              onClick={fetchSettings}
              className="px-4 bg-slate-700 hover:bg-slate-600 text-white rounded"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="bg-card p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <User className="text-blue-500" />
          Profile Customization
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-slate-400 text-sm mb-1">WhatsApp Name</label>
            <div className="flex gap-2">
              <input 
                value={profileName}
                onChange={e => setProfileName(e.target.value)}
                className="flex-1 bg-dark border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-blue-500"
                placeholder="New Name"
              />
              <button 
                onClick={() => handleUpdateProfile('name')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded font-bold"
              >
                Set
              </button>
            </div>
          </div>

          <div>
            <label className="block text-slate-400 text-sm mb-1">Status (About)</label>
            <div className="flex gap-2">
              <input 
                value={profileStatus}
                onChange={e => setProfileStatus(e.target.value)}
                className="flex-1 bg-dark border border-slate-600 rounded px-3 py-2 text-white outline-none focus:border-blue-500"
                placeholder="New Status"
              />
              <button 
                onClick={() => handleUpdateProfile('status')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 rounded font-bold"
              >
                Set
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700">
             <button 
                onClick={async () => {
                  if(confirm('Remove Profile Picture?')) {
                    await chatService.removePicture(selectedInstance);
                    alert('Picture removed');
                  }
                }}
                className="text-red-400 text-sm hover:underline"
             >
               Remove Profile Picture
             </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;