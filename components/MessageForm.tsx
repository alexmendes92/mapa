import React, { useState } from 'react';
import { messageService } from '../services/api';
import { Send, ListChecks, MapPin, Smile, Video, File, Sticker } from 'lucide-react';

interface MessageFormProps {
  selectedInstance: string | null;
}

const MessageForm: React.FC<MessageFormProps> = ({ selectedInstance }) => {
  const [type, setType] = useState('text'); 
  const [number, setNumber] = useState('');
  const [message, setMessage] = useState(''); // Used for Text, Caption, or Sticker URL
  const [mediaUrl, setMediaUrl] = useState('');
  
  // Specific States
  const [pollName, setPollName] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [location, setLocation] = useState({ name: '', address: '', lat: 0, lng: 0 });
  const [reaction, setReaction] = useState({ messageId: '', emoji: '' });

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  const handlePollOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };
  const addPollOption = () => setPollOptions([...pollOptions, '']);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstance) { alert("Please select an instance."); return; }
    setLoading(true); setResponse(null);

    try {
        let res;
        switch(type) {
            case 'text':
                res = await messageService.sendText(selectedInstance, number, message);
                break;
            case 'media':
                res = await messageService.sendMedia(selectedInstance, number, mediaUrl, 'image', message);
                break;
            case 'audio':
                res = await messageService.sendAudio(selectedInstance, number, mediaUrl);
                break;
            case 'ptv':
                res = await messageService.sendPtv(selectedInstance, number, mediaUrl);
                break;
            case 'sticker':
                res = await messageService.sendSticker(selectedInstance, number, mediaUrl);
                break;
            case 'location':
                res = await messageService.sendLocation(selectedInstance, number, location.name, location.address, location.lat, location.lng);
                break;
            case 'poll':
                const validOptions = pollOptions.filter(o => o.trim() !== '');
                res = await messageService.sendPoll(selectedInstance, number, pollName, validOptions);
                break;
            case 'reaction':
                // For reaction, 'number' field serves as RemoteJid or we assume it's part of the ID logic? 
                // The API needs Key ID. We'll use the 'message' field for Message ID and 'number' for JID
                res = await messageService.sendReaction(selectedInstance, reaction.messageId, number, reaction.emoji);
                break;
        }
        setResponse(res);
        if (type === 'text') setMessage('');
    } catch (err: any) {
        setResponse({ error: err.message });
    } finally {
        setLoading(false);
    }
  };

  if (!selectedInstance) return <div className="text-slate-500 text-center mt-20">Select an instance to start messaging.</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-card p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Send size={24} className="text-primary" /> Send Message
        </h2>

        <div className="flex gap-2 mb-6 border-b border-slate-700 pb-1 overflow-x-auto">
            {[
              { id: 'text', icon: File },
              { id: 'media', icon: File },
              { id: 'audio', icon: File },
              { id: 'ptv', icon: Video },
              { id: 'sticker', icon: Sticker },
              { id: 'location', icon: MapPin },
              { id: 'reaction', icon: Smile },
              { id: 'poll', icon: ListChecks }
            ].map(t => (
                <button key={t.id} onClick={() => setType(t.id)} className={`px-4 py-2 rounded-t-lg font-medium text-sm capitalize flex items-center gap-2 transition-colors ${type === t.id ? 'bg-primary/20 text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}>
                    <t.icon size={14} /> {t.id}
                </button>
            ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-slate-400 text-sm mb-1">Remote JID (Number)</label>
                <input type="text" value={number} onChange={(e) => setNumber(e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white focus:border-primary outline-none" placeholder="e.g. 5511999999999@s.whatsapp.net" required />
            </div>

            {['media', 'audio', 'ptv', 'sticker'].includes(type) && (
                 <div>
                    <label className="block text-slate-400 text-sm mb-1">Media/File URL</label>
                    <input type="url" value={mediaUrl} onChange={(e) => setMediaUrl(e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white focus:border-primary outline-none" placeholder="https://..." required />
                </div>
            )}

            {(type === 'text' || type === 'media') && (
                <div>
                    <label className="block text-slate-400 text-sm mb-1">{type === 'media' ? 'Caption' : 'Message'}</label>
                    <textarea value={message} onChange={(e) => setMessage(e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white focus:border-primary outline-none min-h-[100px]" placeholder="Type your message..." required={type === 'text'} />
                </div>
            )}

            {type === 'location' && (
                <div className="space-y-2">
                    <input placeholder="Name (e.g. Home)" value={location.name} onChange={e => setLocation({...location, name: e.target.value})} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white"/>
                    <input placeholder="Address" value={location.address} onChange={e => setLocation({...location, address: e.target.value})} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white"/>
                    <div className="flex gap-2">
                        <input type="number" placeholder="Latitude" value={location.lat} onChange={e => setLocation({...location, lat: parseFloat(e.target.value)})} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white"/>
                        <input type="number" placeholder="Longitude" value={location.lng} onChange={e => setLocation({...location, lng: parseFloat(e.target.value)})} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white"/>
                    </div>
                </div>
            )}

            {type === 'reaction' && (
                <div className="space-y-2">
                    <input placeholder="Message ID (key.id)" value={reaction.messageId} onChange={e => setReaction({...reaction, messageId: e.target.value})} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white" required/>
                    <input placeholder="Emoji (e.g. 👍)" value={reaction.emoji} onChange={e => setReaction({...reaction, emoji: e.target.value})} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white" required/>
                </div>
            )}

            {type === 'poll' && (
                <div className="space-y-3">
                    <input value={pollName} onChange={(e) => setPollName(e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Poll Question" required />
                    {pollOptions.map((opt, idx) => (
                        <input key={idx} value={opt} onChange={(e) => handlePollOptionChange(idx, e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white mb-2" placeholder={`Option ${idx + 1}`} />
                    ))}
                    <button type="button" onClick={addPollOption} className="text-sm text-primary hover:underline flex items-center gap-1"><ListChecks size={14} /> Add Option</button>
                </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-emerald-600 text-darker font-bold py-3 rounded transition-colors disabled:opacity-50">
                {loading ? 'Sending...' : 'Send Message'}
            </button>
        </form>
      </div>

      <div className="bg-card p-6 rounded-lg border border-slate-700 h-fit">
        <h3 className="text-lg font-bold mb-4">API Response</h3>
        <div className="bg-darker p-4 rounded border border-slate-800 font-mono text-xs text-green-400 overflow-auto max-h-[500px]">
            {response ? <pre>{JSON.stringify(response, null, 2)}</pre> : <span className="text-slate-600">// Response...</span>}
        </div>
      </div>
    </div>
  );
};

export default MessageForm;
