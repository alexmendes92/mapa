import React, { useState, useEffect } from 'react';
import { labelService } from '../services/api';
import { Tag, Plus, Trash2, RefreshCw, User, ArrowRight } from 'lucide-react';

interface LabelManagerProps {
  selectedInstance: string | null;
}

const LabelManager: React.FC<LabelManagerProps> = ({ selectedInstance }) => {
  const [labels, setLabels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [number, setNumber] = useState('');
  const [selectedLabelId, setSelectedLabelId] = useState('');
  const [action, setAction] = useState<'add' | 'remove'>('add');
  const [processing, setProcessing] = useState(false);

  const fetchLabels = async () => {
    if (!selectedInstance) return;
    setLoading(true);
    try {
      const data: any = await labelService.findLabels(selectedInstance);
      // Handle response variations (array vs object with key)
      const list = Array.isArray(data) ? data : (data.labels || []);
      setLabels(list);
      if (list.length > 0 && !selectedLabelId) {
          setSelectedLabelId(list[0].id);
      }
    } catch (error) {
      console.error(error);
      alert('Error fetching labels');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, [selectedInstance]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstance || !number || !selectedLabelId) return;
    
    setProcessing(true);
    try {
      await labelService.handleLabel(selectedInstance, number, selectedLabelId, action);
      alert(`Label ${action === 'add' ? 'added to' : 'removed from'} ${number}`);
      setNumber('');
    } catch (error: any) {
      alert('Error processing label action: ' + (error.message || 'Unknown error'));
    } finally {
      setProcessing(false);
    }
  };

  if (!selectedInstance) return <div className="text-center text-slate-500 mt-20">Select an instance to manage labels.</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* List of Labels */}
        <div className="bg-card p-6 rounded-lg border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Tag className="text-primary" /> Available Labels
                </h2>
                <button 
                    onClick={fetchLabels} 
                    disabled={loading}
                    className="p-2 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                >
                    <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
                </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {labels.length === 0 && !loading && (
                    <p className="text-slate-500 text-center py-4">No labels found.</p>
                )}
                
                {labels.map((label: any) => (
                    <div key={label.id} className="bg-dark p-3 rounded border border-slate-700 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <Tag size={16} className="text-slate-400" />
                            <div>
                                <p className="font-bold text-sm text-white">{label.name}</p>
                                <p className="text-xs text-slate-500">ID: {label.id}</p>
                            </div>
                        </div>
                        {label.hexColor && (
                             <div className="w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: label.hexColor }} title={label.hexColor}></div>
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Assign/Remove Label Form */}
        <div className="bg-card p-6 rounded-lg border border-slate-700 h-fit">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <User className="text-blue-500" /> Manage User Labels
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-slate-400 text-sm mb-1">User Number</label>
                    <input 
                        value={number}
                        onChange={e => setNumber(e.target.value)}
                        placeholder="e.g. 5511999999999"
                        className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                        required
                    />
                </div>

                <div>
                    <label className="block text-slate-400 text-sm mb-1">Select Label</label>
                    <select 
                        value={selectedLabelId}
                        onChange={e => setSelectedLabelId(e.target.value)}
                        className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white focus:border-blue-500 outline-none"
                        required
                    >
                        <option value="" disabled>Select a label...</option>
                        {labels.map((l: any) => (
                            <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                     <label className="block text-slate-400 text-sm mb-1">Action</label>
                     <div className="grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={() => setAction('add')}
                            className={`py-2 rounded border flex items-center justify-center gap-2 font-medium transition-colors ${
                                action === 'add' 
                                ? 'bg-primary/20 border-primary text-primary' 
                                : 'bg-dark border-slate-600 text-slate-400 hover:text-white'
                            }`}
                        >
                            <Plus size={16} /> Add Label
                        </button>
                        <button
                            type="button"
                            onClick={() => setAction('remove')}
                            className={`py-2 rounded border flex items-center justify-center gap-2 font-medium transition-colors ${
                                action === 'remove' 
                                ? 'bg-red-500/20 border-red-500 text-red-500' 
                                : 'bg-dark border-slate-600 text-slate-400 hover:text-white'
                            }`}
                        >
                            <Trash2 size={16} /> Remove Label
                        </button>
                     </div>
                </div>

                <button 
                    type="submit" 
                    disabled={processing || !selectedLabelId}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded mt-2 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {processing ? <RefreshCw className="animate-spin" size={18}/> : <ArrowRight size={18} />}
                    {action === 'add' ? 'Apply Label' : 'Remove Label'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default LabelManager;