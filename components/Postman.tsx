import React, { useState, useEffect } from 'react';
import { POSTMAN_COLLECTION } from '../constants/postmanCollection';
import { SERVER_URL, API_KEY } from '../constants';
import { Folder, FileJson, Play, ChevronRight, ChevronDown, Settings as SettingsIcon, Save } from 'lucide-react';

interface PostmanProps {
  selectedInstance: string | null;
  instances: any[];
}

const Postman: React.FC<PostmanProps> = ({ selectedInstance, instances }) => {
  // Environment Variables
  const [env, setEnv] = useState<Record<string, string>>({
    baseUrl: SERVER_URL,
    globalApikey: API_KEY,
    instance: selectedInstance || '',
    remoteJid: '5511999999999',
    number: '5511999999999',
    groupJid: '123456789@g.us',
    apikey: ''
  });

  // UI State
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({});
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  
  // Request State
  const [currentBody, setCurrentBody] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [method, setMethod] = useState('GET');

  // Update instance var if prop changes
  useEffect(() => {
    if (selectedInstance) {
      setEnv(prev => ({ ...prev, instance: selectedInstance }));
    }
  }, [selectedInstance]);

  const toggleFolder = (name: string) => {
    setExpandedFolders(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const handleSelectRequest = (item: any) => {
    setSelectedRequest(item);
    setResponse(null);
    const req = item.request;
    setMethod(req.method);
    setCurrentUrl(req.url?.raw || '');
    // Try to get raw body
    if (req.body && req.body.raw) {
        setCurrentBody(req.body.raw);
    } else {
        setCurrentBody('');
    }
  };

  const replaceVariables = (str: string) => {
    return str.replace(/\{\{(.*?)\}\}/g, (_, key) => {
        return env[key] !== undefined ? env[key] : `{{${key}}}`;
    });
  };

  const executeRequest = async () => {
    setLoading(true);
    setResponse(null);
    try {
        const finalUrl = replaceVariables(currentUrl);
        const finalBody = currentBody ? replaceVariables(currentBody) : undefined;
        
        // Parse body if it exists
        let bodyPayload = undefined;
        if (finalBody && method !== 'GET' && method !== 'HEAD') {
            try {
                bodyPayload = JSON.parse(finalBody);
            } catch (e) {
                // If invalid JSON, send as string or throw? Postman sends as is if raw.
                // But fetch needs stringified body. 
                // We assume the user inputs valid JSON or string.
                // For this app, let's keep it as string if parsing fails, but header is json
                bodyPayload = finalBody; 
            }
        }

        const headers: HeadersInit = {
            'Content-Type': 'application/json',
            'apikey': env.globalApikey
        };

        // Handle Body stringification logic
        const fetchOptions: RequestInit = {
            method: method,
            headers: headers,
            body: typeof bodyPayload === 'object' ? JSON.stringify(bodyPayload) : bodyPayload
        };

        if (method === 'GET' || method === 'HEAD') {
            delete fetchOptions.body;
        }

        const res = await fetch(finalUrl, fetchOptions);
        const contentType = res.headers.get("content-type");
        
        let data;
        if (contentType && contentType.indexOf("application/json") !== -1) {
             data = await res.json();
        } else {
             data = await res.text();
        }

        setResponse({
            status: res.status,
            statusText: res.statusText,
            data: data
        });

    } catch (error: any) {
        setResponse({ error: error.message });
    } finally {
        setLoading(false);
    }
  };

  // Recursive Sidebar Renderer
  const renderTree = (items: any[], path: string = '') => {
    return items.map((item, idx) => {
        const currentPath = `${path}-${idx}`;
        if (item.item) {
            // It's a folder
            const isExpanded = expandedFolders[currentPath];
            return (
                <div key={idx} className="ml-2">
                    <button 
                        onClick={() => toggleFolder(currentPath)}
                        className="flex items-center gap-2 w-full text-left py-1 text-slate-400 hover:text-white text-sm"
                    >
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        <Folder size={14} className="text-yellow-500" />
                        {item.name}
                    </button>
                    {isExpanded && (
                        <div className="border-l border-slate-700 ml-2">
                            {renderTree(item.item, currentPath)}
                        </div>
                    )}
                </div>
            );
        } else {
            // It's a request
            return (
                <button 
                    key={idx}
                    onClick={() => handleSelectRequest(item)}
                    className={`flex items-center gap-2 w-full text-left py-1 ml-4 text-xs font-medium hover:bg-slate-700 px-2 rounded ${selectedRequest === item ? 'bg-primary/20 text-primary' : 'text-slate-300'}`}
                >
                    <span className={`text-[10px] uppercase w-8 font-bold ${getMethodColor(item.request.method)}`}>{item.request.method}</span>
                    <span className="truncate">{item.name}</span>
                </button>
            );
        }
    });
  };

  const getMethodColor = (m: string) => {
      switch(m) {
          case 'POST': return 'text-yellow-500';
          case 'GET': return 'text-green-500';
          case 'DELETE': return 'text-red-500';
          case 'PUT': return 'text-blue-500';
          default: return 'text-slate-400';
      }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Sidebar */}
      <div className="w-1/4 bg-card rounded-lg border border-slate-700 flex flex-col">
        <div className="p-4 border-b border-slate-700 font-bold flex items-center gap-2">
            <FileJson size={18} className="text-orange-500" /> Collection
        </div>
        <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
            {renderTree(POSTMAN_COLLECTION.item)}
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 flex flex-col gap-4">
        {/* Environment Vars */}
        <div className="bg-card p-4 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2 mb-2 text-sm font-bold text-slate-300">
                <SettingsIcon size={14} /> Environment Variables
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                {Object.keys(env).map(key => (
                    <div key={key} className="flex flex-col">
                        <label className="text-[10px] text-slate-500 uppercase">{key}</label>
                        {key === 'instance' ? (
                            <select
                                value={env[key]}
                                onChange={(e) => setEnv({...env, [key]: e.target.value})}
                                className="bg-dark border border-slate-600 rounded px-2 py-1 text-xs text-white outline-none focus:border-primary"
                            >
                                <option value="" disabled>Select Instance</option>
                                {instances.map((item: any) => {
                                    const inst = item.instance || item;
                                    return inst && inst.instanceName ? (
                                        <option key={inst.instanceName} value={inst.instanceName}>
                                            {inst.instanceName}
                                        </option>
                                    ) : null;
                                })}
                            </select>
                        ) : (
                            <input 
                                value={env[key]} 
                                onChange={(e) => setEnv({...env, [key]: e.target.value})}
                                className="bg-dark border border-slate-600 rounded px-2 py-1 text-xs text-white outline-none focus:border-primary"
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>

        {/* Request Panel */}
        <div className="bg-card flex-1 rounded-lg border border-slate-700 flex flex-col overflow-hidden">
            {selectedRequest ? (
                <>
                    {/* Header */}
                    <div className="p-4 border-b border-slate-700">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg font-bold text-white">{selectedRequest.name}</span>
                        </div>
                        <div className="flex gap-2">
                            <select 
                                value={method} 
                                onChange={e => setMethod(e.target.value)}
                                className="bg-dark border border-slate-600 rounded px-3 font-bold text-sm text-white"
                            >
                                <option>GET</option><option>POST</option><option>PUT</option><option>DELETE</option>
                            </select>
                            <div className="flex-1 relative">
                                <input 
                                    value={currentUrl} 
                                    onChange={e => setCurrentUrl(e.target.value)}
                                    className="w-full h-full bg-dark border border-slate-600 rounded px-3 text-sm text-slate-300 font-mono"
                                />
                                <div className="absolute right-0 top-0 h-full flex items-center pr-2 pointer-events-none opacity-50">
                                    <span className="text-xs text-slate-500">{replaceVariables(currentUrl)}</span>
                                </div>
                            </div>
                            <button 
                                onClick={executeRequest}
                                disabled={loading}
                                className="bg-primary hover:bg-emerald-600 text-darker font-bold px-6 rounded flex items-center gap-2"
                            >
                                {loading ? <div className="animate-spin w-4 h-4 border-2 border-darker border-t-transparent rounded-full"/> : <Play size={16} />}
                                Send
                            </button>
                        </div>
                    </div>

                    {/* Body & Response */}
                    <div className="flex-1 flex min-h-0">
                        {/* Request Body */}
                        <div className="w-1/2 flex flex-col border-r border-slate-700">
                            <div className="p-2 bg-darker border-b border-slate-700 text-xs font-bold text-slate-400">Request Body (JSON)</div>
                            <textarea 
                                value={currentBody}
                                onChange={e => setCurrentBody(e.target.value)}
                                className="flex-1 bg-dark p-4 font-mono text-xs text-slate-300 resize-none outline-none"
                                spellCheck={false}
                                placeholder="// JSON Body"
                            />
                        </div>
                        
                        {/* Response */}
                        <div className="w-1/2 flex flex-col">
                             <div className="p-2 bg-darker border-b border-slate-700 text-xs font-bold text-slate-400 flex justify-between">
                                <span>Response</span>
                                {response && (
                                    <span className={`${response.status >= 200 && response.status < 300 ? 'text-green-500' : 'text-red-500'}`}>
                                        {response.status} {response.statusText}
                                    </span>
                                )}
                             </div>
                             <div className="flex-1 bg-darker p-4 font-mono text-xs text-green-400 overflow-auto">
                                {response ? <pre>{JSON.stringify(response.data || response, null, 2)}</pre> : <span className="text-slate-700">// Hit Send to see response...</span>}
                             </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                    <SettingsIcon size={48} className="mb-4 opacity-50" />
                    <p>Select a request from the sidebar to start.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Postman;