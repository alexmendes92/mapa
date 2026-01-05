import React, { useState, useEffect } from 'react';
import { integrationService } from '../services/api';
import { Webhook, Bot, BrainCircuit, MessageCircle, GitBranch, Workflow, Zap, Box } from 'lucide-react';
import { BotIntegrationConfig, ChatwootConfig } from '../types';

interface IntegrationsProps {
  selectedInstance: string | null;
}

const Integrations: React.FC<IntegrationsProps> = ({ selectedInstance }) => {
    const [tab, setTab] = useState('webhook'); 
    
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

    // Chatwoot State
    const [chatwoot, setChatwoot] = useState<ChatwootConfig>({
        enabled: false, accountId: '', token: '', url: '', signMsg: true, reopenConversation: true, conversationPending: false, nameInbox: 'Evolution', mergeBrazilContacts: false, importContacts: true, importMessages: true, daysLimitImportMessages: 3, signDelimiter: '\n', autoCreate: true, organization: '', logo: '', ignoreJids: []
    });

    // Generic Bot State (Dify, Flowise, N8N, EvoAI)
    const initialBotState: BotIntegrationConfig = {
        enabled: false, apiUrl: '', apiKey: '', botType: '', triggerType: 'keyword', triggerOperator: 'contains', triggerValue: '', expire: 20, keywordFinish: '#STOP', delayMessage: 1000, unknownMessage: 'I do not understand', listeningFromMe: false, stopBotFromMe: false, keepOpen: false, debounceTime: 0, ignoreJids: []
    };
    
    const [dify, setDify] = useState<BotIntegrationConfig>(initialBotState);
    const [flowise, setFlowise] = useState<BotIntegrationConfig>(initialBotState);
    const [n8n, setN8N] = useState<BotIntegrationConfig>(initialBotState);
    const [evoai, setEvoai] = useState<BotIntegrationConfig>(initialBotState);

    // Load settings when tab changes or instance changes
    useEffect(() => {
        if (!selectedInstance) return;
        const load = async () => {
            try {
                if (tab === 'webhook') {
                    const data: any = await integrationService.findWebhook(selectedInstance);
                    if (data && data.webhook) {
                        setWebhookUrl(data.webhook.url);
                        setWebhookEnabled(data.webhook.enabled);
                    }
                } else if (tab === 'chatwoot') {
                    const data: any = await integrationService.chatwoot.find(selectedInstance);
                    if (data) setChatwoot({ ...chatwoot, ...data });
                }
                // Add find logic for others as needed
            } catch (e) { console.error(e); }
        };
        load();
    }, [selectedInstance, tab]);

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
            await integrationService.typebot.create(selectedInstance, { ...typebot, triggerOperator: 'contains', delayMessage: 1000, unknownMessage: 'Unknown', listeningFromMe: false });
            alert('Typebot configured!');
        } catch (error) { alert('Error saving Typebot'); }
    };

    const handleChatwootSave = async () => {
        if (!selectedInstance) return;
        try {
            await integrationService.chatwoot.set(selectedInstance, chatwoot);
            alert('Chatwoot configured!');
        } catch (error) { alert('Error saving Chatwoot'); }
    };

    const handleBotSave = async (service: any, config: BotIntegrationConfig, name: string) => {
        if (!selectedInstance) return;
        try {
            await service.create(selectedInstance, config);
            alert(`${name} configured!`);
        } catch (error) { alert(`Error saving ${name}`); }
    };

    if (!selectedInstance) return <div className="text-center text-slate-500 mt-20">Select an instance to configure integrations.</div>;

    const renderBotForm = (state: BotIntegrationConfig, setState: any, onSave: () => void, title: string) => (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-white">{title} Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-2 flex items-center gap-2">
                    <input type="checkbox" checked={state.enabled} onChange={e => setState({...state, enabled: e.target.checked})} className="w-5 h-5 accent-primary" />
                    <span className="text-white font-bold">Enable Integration</span>
                </div>
                <input value={state.apiUrl} onChange={e => setState({...state, apiUrl: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="API URL" />
                <input value={state.apiKey || ''} onChange={e => setState({...state, apiKey: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="API Key (Optional)" />
                <input value={state.triggerValue} onChange={e => setState({...state, triggerValue: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Trigger Keyword" />
                <input type="number" value={state.expire} onChange={e => setState({...state, expire: parseInt(e.target.value)})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Expiration (minutes)" />
                <input value={state.keywordFinish} onChange={e => setState({...state, keywordFinish: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Stop Keyword (e.g. #STOP)" />
                <input type="number" value={state.delayMessage} onChange={e => setState({...state, delayMessage: parseInt(e.target.value)})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Delay (ms)" />
            </div>
            <button onClick={onSave} className="bg-primary hover:bg-emerald-600 text-darker font-bold px-6 py-2 rounded transition-colors">Save {title}</button>
        </div>
    );

    const tabs = [
        { id: 'webhook', label: 'Webhook', icon: Webhook },
        { id: 'typebot', label: 'Typebot', icon: Bot },
        { id: 'openai', label: 'OpenAI', icon: BrainCircuit },
        { id: 'chatwoot', label: 'Chatwoot', icon: MessageCircle },
        { id: 'dify', label: 'Dify', icon: GitBranch },
        { id: 'flowise', label: 'Flowise', icon: Workflow },
        { id: 'n8n', label: 'N8N', icon: Zap },
        { id: 'evoai', label: 'EvoAI', icon: Box },
    ];

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b border-slate-700 pb-2 overflow-x-auto no-scrollbar">
                {tabs.map(t => (
                    <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 px-4 py-2 rounded-t-lg whitespace-nowrap transition-colors ${tab === t.id ? 'bg-primary/20 text-primary border-b-2 border-primary' : 'text-slate-400 hover:text-white'}`}>
                        <t.icon size={16} /> {t.label}
                    </button>
                ))}
            </div>

            <div className="bg-card p-6 rounded-lg border border-slate-700">
                {tab === 'webhook' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Webhook Configuration</h3>
                        <input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} className="w-full bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="https://your-api.com/webhook" />
                        <div className="flex items-center gap-2">
                            <input type="checkbox" checked={webhookEnabled} onChange={(e) => setWebhookEnabled(e.target.checked)} className="w-5 h-5 accent-primary" />
                            <span className="text-slate-300">Enable</span>
                        </div>
                        <button onClick={handleWebhookSave} className="bg-primary text-darker font-bold px-4 py-2 rounded hover:bg-emerald-600 transition-colors">Save Webhook</button>
                    </div>
                )}

                {tab === 'typebot' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Typebot Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input value={typebot.url} onChange={e => setTypebot({...typebot, url: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Typebot URL" />
                            <input value={typebot.typebot} onChange={e => setTypebot({...typebot, typebot: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Typebot Name" />
                            <input value={typebot.triggerValue} onChange={e => setTypebot({...typebot, triggerValue: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Trigger Keyword" />
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={typebot.enabled} onChange={e => setTypebot({...typebot, enabled: e.target.checked})} className="w-5 h-5 accent-primary" />
                                <span className="text-slate-300">Enabled</span>
                            </div>
                        </div>
                        <button onClick={handleTypebotSave} className="bg-primary text-darker font-bold px-4 py-2 rounded hover:bg-emerald-600 transition-colors">Save Typebot</button>
                    </div>
                )}
                
                {tab === 'openai' && (
                     <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">OpenAI Configuration</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <input value={openai.model} onChange={e => setOpenai({...openai, model: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Model (gpt-4o)" />
                            <input type="number" value={openai.maxTokens} onChange={e => setOpenai({...openai, maxTokens: parseInt(e.target.value)})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Max Tokens" />
                        </div>
                         <button className="bg-slate-700 text-slate-400 px-4 py-2 rounded cursor-not-allowed">Configure via Raw API (Complex Object)</button>
                    </div>
                )}

                {tab === 'chatwoot' && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-white">Chatwoot Configuration</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                             <div className="col-span-2 flex items-center gap-2">
                                <input type="checkbox" checked={chatwoot.enabled} onChange={e => setChatwoot({...chatwoot, enabled: e.target.checked})} className="w-5 h-5 accent-primary" />
                                <span className="text-white font-bold">Enable Chatwoot</span>
                            </div>
                            <input value={chatwoot.url} onChange={e => setChatwoot({...chatwoot, url: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Chatwoot URL" />
                            <input value={chatwoot.accountId} onChange={e => setChatwoot({...chatwoot, accountId: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Account ID" />
                            <input value={chatwoot.token} onChange={e => setChatwoot({...chatwoot, token: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Token" />
                            <input value={chatwoot.nameInbox} onChange={e => setChatwoot({...chatwoot, nameInbox: e.target.value})} className="bg-dark border border-slate-600 rounded px-3 py-2 text-white" placeholder="Inbox Name" />
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={chatwoot.signMsg} onChange={e => setChatwoot({...chatwoot, signMsg: e.target.checked})} className="accent-primary" />
                                <span className="text-slate-400 text-sm">Sign Message</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <input type="checkbox" checked={chatwoot.importMessages} onChange={e => setChatwoot({...chatwoot, importMessages: e.target.checked})} className="accent-primary" />
                                <span className="text-slate-400 text-sm">Import Messages</span>
                            </div>
                             <div className="flex items-center gap-2">
                                <input type="checkbox" checked={chatwoot.importContacts} onChange={e => setChatwoot({...chatwoot, importContacts: e.target.checked})} className="accent-primary" />
                                <span className="text-slate-400 text-sm">Import Contacts</span>
                            </div>
                        </div>
                        <button onClick={handleChatwootSave} className="bg-primary text-darker font-bold px-6 py-2 rounded hover:bg-emerald-600 transition-colors">Save Chatwoot</button>
                    </div>
                )}

                {tab === 'dify' && renderBotForm(dify, setDify, () => handleBotSave(integrationService.dify, dify, 'Dify'), 'Dify')}
                {tab === 'flowise' && renderBotForm(flowise, setFlowise, () => handleBotSave(integrationService.flowise, flowise, 'Flowise'), 'Flowise')}
                {tab === 'n8n' && renderBotForm(n8n, setN8N, () => handleBotSave(integrationService.n8n, n8n, 'N8N'), 'N8N')}
                {tab === 'evoai' && renderBotForm(evoai, setEvoai, () => handleBotSave(integrationService.evoai, evoai, 'EvoAI'), 'EvoAI')}
            </div>
        </div>
    );
};

export default Integrations;