import React, { useState } from 'react';
import { messageService } from '../services/api';
import { Button, ListSection, TemplateComponent } from '../types';
import { 
  Send, ListChecks, MapPin, Smile, Video, File, Sticker, 
  MousePointer, List, Layout, Plus, Trash2, X
} from 'lucide-react';

interface MessageFormProps {
  selectedInstance: string | null;
}

const MessageForm: React.FC<MessageFormProps> = ({ selectedInstance }) => {
  const [type, setType] = useState('text'); 
  const [number, setNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<any>(null);

  // Common/Simple States
  const [message, setMessage] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  
  // Specific States
  const [pollName, setPollName] = useState('');
  const [pollOptions, setPollOptions] = useState<string[]>(['', '']);
  const [location, setLocation] = useState({ name: '', address: '', lat: 0, lng: 0 });
  const [reaction, setReaction] = useState({ messageId: '', emoji: '' });

  // --- Complex Message States ---

  // Buttons
  const [btnTitle, setBtnTitle] = useState('');
  const [btnDesc, setBtnDesc] = useState('');
  const [btnFooter, setBtnFooter] = useState('');
  const [buttons, setButtons] = useState<Button[]>([]);
  // Temp state for adding a button
  const [newBtn, setNewBtn] = useState<Partial<Button>>({ type: 'reply', displayText: '' });

  // Lists
  const [listTitle, setListTitle] = useState('');
  const [listDesc, setListDesc] = useState('');
  const [listBtnText, setListBtnText] = useState('');
  const [listFooter, setListFooter] = useState('');
  const [listSections, setListSections] = useState<ListSection[]>([]);

  // Templates
  const [templateName, setTemplateName] = useState('');
  // We will use a simplified JSON editor for components to ensure maximum compatibility with the API
  // or a basic builder. Let's do a basic builder for Body variables.
  const [templateComponents, setTemplateComponents] = useState<string>('[]'); // JSON string for flexibility

  // --- Handlers ---

  // Button Handlers
  const handleAddButton = () => {
    if (!newBtn.displayText) return;
    setButtons([...buttons, newBtn as Button]);
    setNewBtn({ type: 'reply', displayText: '' });
  };
  const removeButton = (idx: number) => setButtons(buttons.filter((_, i) => i !== idx));

  // List Handlers
  const addSection = () => setListSections([...listSections, { title: '', rows: [] }]);
  const updateSectionTitle = (idx: number, title: string) => {
    const newSections = [...listSections];
    newSections[idx].title = title;
    setListSections(newSections);
  };
  const removeSection = (idx: number) => setListSections(listSections.filter((_, i) => i !== idx));
  
  const addRowToSection = (sectionIdx: number) => {
    const newSections = [...listSections];
    newSections[sectionIdx].rows.push({ title: '', description: '', rowId: Math.random().toString(36).substr(2, 9) });
    setListSections(newSections);
  };
  const updateRow = (sectionIdx: number, rowIdx: number, field: string, value: string) => {
    const newSections = [...listSections];
    (newSections[sectionIdx].rows[rowIdx] as any)[field] = value;
    setListSections(newSections);
  };
  const removeRow = (sectionIdx: number, rowIdx: number) => {
    const newSections = [...listSections];
    newSections[sectionIdx].rows = newSections[sectionIdx].rows.filter((_, i) => i !== rowIdx);
    setListSections(newSections);
  };

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
                res = await messageService.sendReaction(selectedInstance, reaction.messageId, number, reaction.emoji);
                break;
            case 'buttons':
                res = await messageService.sendButtons(selectedInstance, number, btnTitle, btnDesc, buttons, btnFooter);
                break;
            case 'list':
                res = await messageService.sendList(selectedInstance, number, listTitle, listDesc, listBtnText, listSections, listFooter);
                break;
            case 'template':
                let parsedComponents: TemplateComponent[] = [];
                try { parsedComponents = JSON.parse(templateComponents); } catch(e) { throw new Error("Invalid JSON in components"); }
                res = await messageService.sendTemplate(selectedInstance, number, templateName, parsedComponents);
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
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      <div className="bg-card p-6 rounded-lg border border-slate-700">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Send size={24} className="text-primary" /> Send Message
        </h2>

        <div className="flex gap-2 mb-6 border-b border-slate-700 pb-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'text', icon: File },
              { id: 'media', icon: File },
              { id: 'buttons', icon: MousePointer },
              { id: 'list', icon: List },
              { id: 'template', icon: Layout },
              { id: 'audio', icon: File },
              { id: 'ptv', icon: Video },
              { id: 'sticker', icon: Sticker },
              { id: 'location', icon: MapPin },
              { id: 'reaction', icon: Smile },
              { id: 'poll', icon: ListChecks }
            ].map(t => (
                <button key={t.id} onClick={() => setType(t.id)} className={`px-4 py-2 rounded-t-lg font-medium text-sm capitalize flex items-center gap-2 transition-colors whitespace-nowrap ${type === t.id ? 'bg-primary/20 text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}>
                    <t.icon size={14} /> {t.id}
                </button>
            ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-slate-400 text-sm mb-1">Remote JID (Number)</label>
                <input type="text" value={number} onChange={(e) => setNumber(e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white focus:border-primary outline-none" placeholder="e.g. 5511999999999@s.whatsapp.net" required />
            </div>

            {/* --- BASIC TYPES --- */}
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

            {/* --- BUTTONS --- */}
            {type === 'buttons' && (
              <div className="space-y-4">
                 <input placeholder="Title" value={btnTitle} onChange={e => setBtnTitle(e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white" />
                 <input placeholder="Description" value={btnDesc} onChange={e => setBtnDesc(e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white" />
                 <input placeholder="Footer" value={btnFooter} onChange={e => setBtnFooter(e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white" />
                 
                 <div className="p-3 bg-dark/50 rounded border border-slate-700">
                    <h4 className="text-sm font-bold text-slate-300 mb-2">Add Button</h4>
                    <div className="grid grid-cols-2 gap-2 mb-2">
                      <select 
                        value={newBtn.type} 
                        onChange={e => setNewBtn({...newBtn, type: e.target.value as any})}
                        className="bg-dark border border-slate-600 rounded px-2 py-1 text-white text-sm"
                      >
                        <option value="reply">Reply</option>
                        <option value="url">URL Link</option>
                        <option value="call">Phone Call</option>
                        <option value="copy">Copy Code</option>
                      </select>
                      <input placeholder="Display Text" value={newBtn.displayText} onChange={e => setNewBtn({...newBtn, displayText: e.target.value})} className="bg-dark border border-slate-600 rounded px-2 py-1 text-white text-sm" />
                    </div>
                    {newBtn.type === 'reply' && <input placeholder="ID (Optional)" value={newBtn.id || ''} onChange={e => setNewBtn({...newBtn, id: e.target.value})} className="w-full bg-dark border border-slate-600 rounded px-2 py-1 text-white text-sm mb-2" />}
                    {newBtn.type === 'url' && <input placeholder="https://..." value={newBtn.url || ''} onChange={e => setNewBtn({...newBtn, url: e.target.value})} className="w-full bg-dark border border-slate-600 rounded px-2 py-1 text-white text-sm mb-2" />}
                    {newBtn.type === 'call' && <input placeholder="Phone Number" value={newBtn.phoneNumber || ''} onChange={e => setNewBtn({...newBtn, phoneNumber: e.target.value})} className="w-full bg-dark border border-slate-600 rounded px-2 py-1 text-white text-sm mb-2" />}
                    {newBtn.type === 'copy' && <input placeholder="Code to Copy" value={newBtn.copyCode || ''} onChange={e => setNewBtn({...newBtn, copyCode: e.target.value})} className="w-full bg-dark border border-slate-600 rounded px-2 py-1 text-white text-sm mb-2" />}
                    
                    <button type="button" onClick={handleAddButton} className="w-full bg-secondary/20 text-secondary hover:bg-secondary/30 py-1 rounded text-sm font-bold flex justify-center items-center gap-1">
                      <Plus size={14} /> Add Button to List
                    </button>
                 </div>

                 <div className="space-y-2">
                    {buttons.map((b, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-dark p-2 rounded border border-slate-700">
                        <span className="text-sm"><span className="text-xs bg-slate-700 px-1 rounded mr-2">{b.type}</span>{b.displayText}</span>
                        <button type="button" onClick={() => removeButton(idx)} className="text-red-400 hover:text-red-300"><Trash2 size={14}/></button>
                      </div>
                    ))}
                 </div>
              </div>
            )}

            {/* --- LISTS --- */}
            {type === 'list' && (
              <div className="space-y-4">
                <input placeholder="Title" value={listTitle} onChange={e => setListTitle(e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white" />
                <input placeholder="Description" value={listDesc} onChange={e => setListDesc(e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white" />
                <input placeholder="Button Label (Required)" value={listBtnText} onChange={e => setListBtnText(e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white" />
                <input placeholder="Footer" value={listFooter} onChange={e => setListFooter(e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white" />
                
                <div className="border-t border-slate-700 pt-2">
                  <div className="flex justify-between items-center mb-2">
                     <h4 className="text-sm font-bold text-slate-300">Sections</h4>
                     <button type="button" onClick={addSection} className="text-primary text-sm hover:underline flex items-center gap-1"><Plus size={14}/> Add Section</button>
                  </div>
                  
                  {listSections.map((section, sIdx) => (
                    <div key={sIdx} className="bg-dark/30 p-3 rounded border border-slate-700 mb-4">
                      <div className="flex justify-between mb-2 gap-2">
                        <input placeholder="Section Title" value={section.title} onChange={e => updateSectionTitle(sIdx, e.target.value)} className="flex-1 bg-dark border border-slate-600 rounded px-2 py-1 text-white text-sm" />
                        <button type="button" onClick={() => removeSection(sIdx)} className="text-red-500"><Trash2 size={16}/></button>
                      </div>

                      <div className="space-y-2 pl-2 border-l-2 border-slate-600">
                        {section.rows.map((row, rIdx) => (
                           <div key={rIdx} className="grid grid-cols-1 md:grid-cols-3 gap-2 bg-dark p-2 rounded relative group">
                              <input placeholder="Row Title" value={row.title} onChange={e => updateRow(sIdx, rIdx, 'title', e.target.value)} className="bg-transparent border-b border-slate-600 text-xs outline-none text-white placeholder-slate-500" />
                              <input placeholder="Description" value={row.description} onChange={e => updateRow(sIdx, rIdx, 'description', e.target.value)} className="bg-transparent border-b border-slate-600 text-xs outline-none text-white placeholder-slate-500" />
                              <input placeholder="Row ID" value={row.rowId} onChange={e => updateRow(sIdx, rIdx, 'rowId', e.target.value)} className="bg-transparent border-b border-slate-600 text-xs outline-none text-white placeholder-slate-500" />
                              <button type="button" onClick={() => removeRow(sIdx, rIdx)} className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X size={10}/></button>
                           </div>
                        ))}
                        <button type="button" onClick={() => addRowToSection(sIdx)} className="text-xs text-blue-400 hover:underline">+ Add Row</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- TEMPLATES --- */}
            {type === 'template' && (
              <div className="space-y-4">
                <input placeholder="Template Name (e.g. hello_world)" value={templateName} onChange={e => setTemplateName(e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white" />
                <div>
                   <label className="block text-slate-400 text-sm mb-1">Components (JSON Array)</label>
                   <p className="text-xs text-slate-500 mb-2">Use standard WhatsApp Cloud API component structure.</p>
                   <textarea 
                      value={templateComponents}
                      onChange={e => setTemplateComponents(e.target.value)}
                      className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white font-mono text-xs h-40"
                      spellCheck={false}
                   />
                </div>
              </div>
            )}

            {/* --- LOCATION --- */}
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

            {/* --- REACTION --- */}
            {type === 'reaction' && (
                <div className="space-y-2">
                    <input placeholder="Message ID (key.id)" value={reaction.messageId} onChange={e => setReaction({...reaction, messageId: e.target.value})} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white" required/>
                    <input placeholder="Emoji (e.g. 👍)" value={reaction.emoji} onChange={e => setReaction({...reaction, emoji: e.target.value})} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white" required/>
                </div>
            )}

            {/* --- POLL --- */}
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

      <div className="bg-card p-6 rounded-lg border border-slate-700 h-full max-h-[800px] flex flex-col">
        <h3 className="text-lg font-bold mb-4">API Response</h3>
        <div className="flex-1 bg-darker p-4 rounded border border-slate-800 font-mono text-xs text-green-400 overflow-auto">
            {response ? <pre>{JSON.stringify(response, null, 2)}</pre> : <span className="text-slate-600">// Response...</span>}
        </div>
      </div>
    </div>
  );
};

export default MessageForm;