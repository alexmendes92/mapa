import React, { useState } from 'react';
import { rawService } from '../services/api';
import { Terminal, Play } from 'lucide-react';

interface RawApiProps {
    selectedInstance: string | null;
}

const RawApi: React.FC<RawApiProps> = ({ selectedInstance }) => {
    const [method, setMethod] = useState('POST');
    const [endpoint, setEndpoint] = useState('/message/sendText/');
    const [body, setBody] = useState('{\n  "number": "55...",\n  "text": "Hello"\n}');
    const [response, setResponse] = useState<any>(null);

    const handleExecute = async () => {
        try {
            // Replace placeholder in endpoint if user wants convenient instance injection
            let finalEndpoint = endpoint;
            if (selectedInstance && endpoint.includes('{instance}')) {
                finalEndpoint = endpoint.replace('{instance}', selectedInstance);
            }
            
            const parsedBody = method !== 'GET' ? JSON.parse(body) : undefined;
            const res = await rawService.execute(method, finalEndpoint, parsedBody);
            setResponse(res);
        } catch (error: any) {
            setResponse({ error: error.message });
        }
    };

    return (
        <div className="grid grid-cols-1 gap-6 h-full">
            <div className="bg-card p-6 rounded-lg border border-slate-700 flex flex-col h-full">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Terminal className="text-green-500" /> Raw API Executor
                </h2>
                <p className="text-slate-400 text-sm mb-4">
                    Use this terminal to access <strong>all</strong> Evolution API functions defined in the documentation. 
                    You can manually type endpoints like <code>/chatwoot/set/{'{instance}'}</code> or <code>/openai/create/{'{instance}'}</code>.
                </p>

                <div className="flex gap-4 mb-4">
                    <select 
                        value={method} 
                        onChange={e => setMethod(e.target.value)}
                        className="bg-dark border border-slate-600 rounded px-3 text-white font-bold"
                    >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                    </select>
                    <input 
                        className="flex-1 bg-dark border border-slate-600 rounded px-3 py-2 text-white font-mono text-sm"
                        value={endpoint}
                        onChange={e => setEndpoint(e.target.value)}
                        placeholder="/endpoint/..."
                    />
                    <button 
                        onClick={handleExecute}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 rounded font-bold flex items-center gap-2"
                    >
                        <Play size={16} /> Run
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 min-h-0">
                    <div className="flex flex-col">
                        <label className="text-slate-500 text-xs mb-1">Request Body (JSON)</label>
                        <textarea 
                            className="flex-1 bg-darker border border-slate-700 rounded p-3 font-mono text-xs text-slate-300 resize-none focus:border-primary outline-none"
                            value={body}
                            onChange={e => setBody(e.target.value)}
                            spellCheck={false}
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-slate-500 text-xs mb-1">Response</label>
                        <div className="flex-1 bg-darker border border-slate-700 rounded p-3 font-mono text-xs text-green-400 overflow-auto">
                            {response ? <pre>{JSON.stringify(response, null, 2)}</pre> : <span className="text-slate-700">Waiting for request...</span>}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RawApi;
