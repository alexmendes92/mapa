import React, { useState } from 'react';
import { chatService } from '../services/api';
import { Smartphone, Search, Image as ImageIcon, Archive, Ban, Unlock } from 'lucide-react';

interface ChatUtilsProps {
  selectedInstance: string | null;
}

const ChatUtils: React.FC<ChatUtilsProps> = ({ selectedInstance }) => {
  const [number, setNumber] = useState('');
  const [checkResult, setCheckResult] = useState<any>(null);
  const [pfpResult, setPfpResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const action = async (fn: () => Promise<any>) => {
    if (!selectedInstance || !number) return;
    setLoading(true);
    try { await fn(); alert('Action successful'); } 
    catch (e: any) { alert(e.message); } 
    finally { setLoading(false); }
  };

  const handleCheckNumber = async () => {
    if (!selectedInstance || !number) return;
    setLoading(true);
    try {
      const data: any = await chatService.checkNumber(selectedInstance, number);
      setCheckResult(data);
    } catch (error: any) { setCheckResult({ error: error.message }); } finally { setLoading(false); }
  };

  const handleGetPfp = async () => {
    if (!selectedInstance || !number) return;
    setLoading(true);
    try {
      const data: any = await chatService.getProfilePicture(selectedInstance, number);
      if (data && data.profilePictureUrl) setPfpResult(data.profilePictureUrl);
      else alert('No profile picture found.');
    } catch (error) { alert('Error fetching PFP'); } finally { setLoading(false); }
  };

  if (!selectedInstance) return <div className="text-center text-slate-500 mt-20">Select an instance to use tools.</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-card p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Smartphone className="text-purple-500" /> Number Utilities
        </h2>
        
        <div className="flex gap-4 mb-6">
          <input value={number} onChange={e => setNumber(e.target.value)} placeholder="Number (e.g. 5511999999999)" className="flex-1 bg-dark border border-slate-600 rounded px-4 py-2 text-white outline-none focus:border-purple-500" />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button onClick={handleCheckNumber} disabled={loading} className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded flex items-center justify-center gap-2">
            <Search size={16} /> Check
          </button>
          <button onClick={handleGetPfp} disabled={loading} className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2">
            <ImageIcon size={16} /> PFP
          </button>
          <button onClick={() => action(() => chatService.archiveChat(selectedInstance, number + '@s.whatsapp.net', true))} disabled={loading} className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2">
            <Archive size={16} /> Archive
          </button>
           <button onClick={() => action(() => chatService.updateBlockStatus(selectedInstance, number, 'block'))} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded flex items-center justify-center gap-2">
            <Ban size={16} /> Block
          </button>
        </div>
      </div>

      {(checkResult || pfpResult) && (
        <div className="bg-card p-6 rounded-lg border border-slate-700 animate-fade-in">
           {checkResult && <pre className="bg-darker p-3 rounded text-green-400 text-xs overflow-auto mb-4">{JSON.stringify(checkResult, null, 2)}</pre>}
           {pfpResult && <div className="flex justify-center"><img src={pfpResult} alt="Profile" className="w-32 h-32 rounded-full border-4 border-purple-500 object-cover" /></div>}
        </div>
      )}
    </div>
  );
};

export default ChatUtils;
