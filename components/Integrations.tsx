import React, { useState } from 'react';
import { integrationService } from '../services/api';
import { Webhook, Bot, BrainCircuit } from 'lucide-react';

interface IntegrationsProps {
  selectedInstance: string | null;
}

const Integrations: React.FC<IntegrationsProps> = ({ selectedInstance }) => {
    const [tab, setTab] = useState('webhook'); // webhook, typebot, openai
    
    // Webhook State
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookEnabled, setWebhookEnabled] = useState(true);

    // Typebot State
    const [typebot, setTypebot] = useState({
        enabled: false, url: '', typebot: '', triggerType: 'keyword', triggerValue: '', expire: 20
    });

    // OpenAI State
    const [openai, setOpenai] = useState({
        enabled: false, model: 'gpt-4o', systemMessage: 'You are a helpful assistant', maxTokens: 300
    });

    const handleWebhookSave = async () => {
        if (!selectedInstance) return;
        try {
            await integrationService.setWebhook(selectedInstance, webhookUrl, webhookEnabled);
            alert('Webhook settings saved!');
        } catch (error) { alert('Error saving webhook'); }
    };

    const handleTypebotSave = async () => {
        if (!selectedInstance) return;
        try {
            await integrationService.typebot.create(selectedInstance, {
                ...typebot,
                triggerOperator: 'contains',
                delayMessage: 1000,
                unknownMessage: 'Unknown',
                listeningFromMe: false
            });
            alert('Typebot configured!');
        } catch (error) { alert('Error saving Typebot'); }
    };

    if (!selectedInstance) return <div className="text-center text-slate-500 mt-20">Select an instance to configure integrations.</div>;

    return (
        <div className="space-y-6">
            <div className="flex gap-4 border-b border-slate-700 pb-2">
                <button onClick={() => setTab('webhook')} className={`flex items-center gap-2 px-4 py-2 rounded-t-lg ${tab === 'webhook' ? 'bg-primary/20 text-primary border-b-2 border-primary' : 'text-slate-400'}`}>
                    <Webhook size={18} /> Webhook
                </button>
                <button onClick={() => setTab('typebot')} className={`flex items-center gap-2 px-4 py-2 rounded-t-lg ${tab === 'typebot' ? 'bg-primary/20 text-primary border-b-2 border-primary' : 'text-slate-400'}`}>
                    <Bot size={18} /> Typebot
                </button>
                <button onClick={() => setTab('openai')} className={`flex items-center gap-2 px-4 py-2 rounded-t-lg ${tab === 'openai' ? 'bg-primary/20 text-primary border-b-2 border-primary' : 'text-slate-400'}`}>
                    <BrainCircuit size={18} /> OpenAI
                </button>
            </div>

            <div className="bg-card p-6 rounded-lg border border-slate-700">
                {tab === 'webhook' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Webhook Configuration</h3>
                        <input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="https://your-api.com/webhook" />
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={webhookEnabled} onChange={(e) => setWebhookEnabled(e.target.checked)} className="accent-primary" />
                            <span className="text-slate-300">Enable</span>
                        </div>
                        <button onClick={handleWebhookSave} className="bg-primary text-darker font-bold px-4 py-2 rounded">Save Webhook</button>
                    </div>
                )}

                {tab === 'typebot' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Typebot Configuration</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input value={typebot.url} onChange={e => setTypebot({...typebot, url: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Typebot URL (e.g. https://viewer.typebot.io/)" />
                            <input value={typebot.typebot} onChange={e => setTypebot({...typebot, typebot: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Typebot Name/Slug" />
                            <input value={typebot.triggerValue} onChange={e => setTypebot({...typebot, triggerValue: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Trigger Keyword" />
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={typebot.enabled} onChange={e => setTypebot({...typebot, enabled: e.target.checked})} className="accent-primary" />
                                <span className="text-slate-300">Enabled</span>
                            </div>
                        </div>
                        <button onClick={handleTypebotSave} className="bg-primary text-darker font-bold px-4 py-2 rounded">Save Typebot</button>
                    </div>
                )}
                
                {tab === 'openai' && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">OpenAI Configuration</h3>
                         <p className="text-sm text-slate-500">Requires creating credentials via API first.</p>
                        <div className="grid grid-cols-2 gap-4">
                            <input value={openai.model} onChange={e => setOpenai({...openai, model: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Model (gpt-4o)" />
                            <input type="number" value={openai.maxTokens} onChange={e => setOpenai({...openai, maxTokens: parseInt(e.target.value)})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Max Tokens" />
                        </div>
                         <button className="bg-slate-700 text-slate-400 px-4 py-2 rounded cursor-not-allowed">Configure via Raw API (Complex Object)</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Integrations;