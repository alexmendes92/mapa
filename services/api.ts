import { API_KEY, SERVER_URL } from '../constants';
import { BotIntegrationConfig, Button, ChatwootConfig, ListSection, TemplateComponent } from '../types';

const getHeaders = (customKey?: string) => ({
  'Content-Type': 'application/json',
  'apikey': customKey || API_KEY
});

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${SERVER_URL}${endpoint}`;
  
  // Debug Log: Request
  console.log(`[API Req] ${options.method || 'GET'} ${url}`);

  const config = {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  };

  try {
    const response = await fetch(url, config);
    
    // Debug Log: Response Status
    console.log(`[API Res] ${url} - Status: ${response.status}`);

    const data = await response.json().catch(() => ({})); 
    if (!response.ok) {
        console.error(`[API Error] ${url}`, data);
        throw new Error(data.message || data.error || `Error ${response.status}`);
    }
    return data as T;
  } catch (error: any) {
    console.error(`API Exception on ${url}:`, error);
    throw error;
  }
}

// 1. Instance
export const instanceService = {
  create: (instanceName: string) => request('/instance/create', { method: 'POST', body: JSON.stringify({ instanceName, qrcode: true, integration: 'WHATSAPP-BAILEYS' }) }),
  fetchInstances: () => request<any[]>('/instance/fetchInstances', { method: 'GET' }),
  connect: (instanceName: string) => request(`/instance/connect/${instanceName}`, { method: 'GET' }),
  logout: (instanceName: string) => request(`/instance/logout/${instanceName}`, { method: 'DELETE' }),
  delete: (instanceName: string) => request(`/instance/delete/${instanceName}`, { method: 'DELETE' }),
  restart: (instanceName: string) => request(`/instance/restart/${instanceName}`, { method: 'POST' }),
  connectionState: (instanceName: string) => request(`/instance/connectionState/${instanceName}`, { method: 'GET' }),
  setPresence: (instance: string, presence: 'available' | 'unavailable') => request(`/instance/setPresence/${instance}`, { method: 'POST', body: JSON.stringify({ presence }) }),
};

// 2. Proxy
export const proxyService = {
  set: (instance: string, proxy: any) => request(`/proxy/set/${instance}`, { method: 'POST', body: JSON.stringify(proxy) }),
  find: (instance: string) => request(`/proxy/find/${instance}`, { method: 'GET' }),
};

// 3. Settings
export const settingsService = {
  find: (instance: string) => request(`/settings/find/${instance}`, { method: 'GET' }),
  set: (instance: string, settings: any) => request(`/settings/set/${instance}`, { method: 'POST', body: JSON.stringify(settings) }),
};

// 4. Send Message (Expanded)
export const messageService = {
  sendText: (instance: string, number: string, text: string) => request(`/message/sendText/${instance}`, { method: 'POST', body: JSON.stringify({ number, text, delay: 1200 }) }),
  sendMedia: (instance: string, number: string, media: string, mediatype: 'image' | 'video' | 'document', caption: string) => request(`/message/sendMedia/${instance}`, { method: 'POST', body: JSON.stringify({ number, mediatype, media, caption }) }),
  sendAudio: (instance: string, number: string, audio: string) => request(`/message/sendWhatsAppAudio/${instance}`, { method: 'POST', body: JSON.stringify({ number, audio }) }),
  sendPtv: (instance: string, number: string, video: string) => request(`/message/sendPtv/${instance}`, { method: 'POST', body: JSON.stringify({ number, video }) }), // Video Note
  sendStatus: (instance: string, content: string, type: 'text'|'image'|'video') => request(`/message/sendStatus/${instance}`, { method: 'POST', body: JSON.stringify({ type, content, statusJidList: [] }) }),
  sendSticker: (instance: string, number: string, sticker: string) => request(`/message/sendSticker/${instance}`, { method: 'POST', body: JSON.stringify({ number, sticker }) }),
  sendLocation: (instance: string, number: string, name: string, address: string, latitude: number, longitude: number) => request(`/message/sendLocation/${instance}`, { method: 'POST', body: JSON.stringify({ number, name, address, latitude, longitude }) }),
  sendContact: (instance: string, number: string, contactData: any[]) => request(`/message/sendContact/${instance}`, { method: 'POST', body: JSON.stringify({ number, contact: contactData }) }),
  sendReaction: (instance: string, keyId: string, remoteJid: string, reaction: string, fromMe: boolean = true) => request(`/message/sendReaction/${instance}`, { method: 'POST', body: JSON.stringify({ key: { id: keyId, remoteJid, fromMe }, reaction }) }),
  sendPoll: (instance: string, number: string, name: string, values: string[]) => request(`/message/sendPoll/${instance}`, { method: 'POST', body: JSON.stringify({ number, name, selectableCount: 1, values }) }),
  
  // Advanced Messages
  sendButtons: (instance: string, number: string, title: string, description: string, buttons: Button[], footer?: string) => 
    request(`/message/sendButtons/${instance}`, { method: 'POST', body: JSON.stringify({ number, title, description, buttons, footer }) }),
  
  sendList: (instance: string, number: string, title: string, description: string, buttonText: string, sections: ListSection[], footerText?: string) => 
    request(`/message/sendList/${instance}`, { method: 'POST', body: JSON.stringify({ number, title, description, buttonText, sections, footerText }) }),

  sendTemplate: (instance: string, number: string, templateName: string, components: TemplateComponent[], language: string = 'en_US') =>
    request(`/message/sendTemplate/${instance}`, { method: 'POST', body: JSON.stringify({ number, name: templateName, language, components }) }),
};

// 5. Chat & Profile (Expanded)
export const chatService = {
  checkNumber: (instance: string, number: string) => request(`/chat/whatsappNumbers/${instance}`, { method: 'POST', body: JSON.stringify({ numbers: [number] }) }),
  markRead: (instance: string, remoteJid: string, id: string, fromMe: boolean) => request(`/chat/markMessageAsRead/${instance}`, { method: 'POST', body: JSON.stringify({ readMessages: [{ remoteJid, fromMe, id }] }) }),
  archiveChat: (instance: string, chat: string, archive: boolean) => request(`/chat/archiveChat/${instance}`, { method: 'POST', body: JSON.stringify({ chat, archive }) }),
  deleteMessage: (instance: string, remoteJid: string, id: string, fromMe: boolean) => request(`/chat/deleteMessageForEveryone/${instance}`, { method: 'DELETE', body: JSON.stringify({ remoteJid, id, fromMe }) }),
  getProfilePicture: (instance: string, number: string) => request(`/chat/fetchProfilePictureUrl/${instance}`, { method: 'POST', body: JSON.stringify({ number }) }),
  updateBlockStatus: (instance: string, number: string, status: 'block' | 'unblock') => request(`/message/updateBlockStatus/${instance}`, { method: 'POST', body: JSON.stringify({ number, status }) }),
  findChats: (instance: string) => request(`/chat/findChats/${instance}`, { method: 'POST', body: JSON.stringify({}) }),
  
  // New Methods
  findMessages: (instance: string, remoteJid: string, page: number = 1, offset: number = 10) =>
    request(`/chat/findMessages/${instance}`, { method: 'POST', body: JSON.stringify({ where: { key: { remoteJid } }, page, offset }) }),
  
  markChatUnread: (instance: string, remoteJid: string) =>
    request(`/chat/markChatUnread/${instance}`, { method: 'POST', body: JSON.stringify({ chat: remoteJid }) }),

  // Profile
  updateName: (instance: string, name: string) => request(`/chat/updateProfileName/${instance}`, { method: 'POST', body: JSON.stringify({ name }) }),
  updateStatus: (instance: string, status: string) => request(`/chat/updateProfileStatus/${instance}`, { method: 'POST', body: JSON.stringify({ status }) }),
  updatePicture: (instance: string, picture: string) => request(`/chat/updateProfilePicture/${instance}`, { method: 'POST', body: JSON.stringify({ picture }) }),
  removePicture: (instance: string) => request(`/chat/removeProfilePicture/${instance}`, { method: 'DELETE' }),
  fetchPrivacy: (instance: string) => request(`/chat/fetchPrivacySettings/${instance}`, { method: 'GET' }),
  updatePrivacy: (instance: string, settings: any) => request(`/chat/updatePrivacySettings/${instance}`, { method: 'POST', body: JSON.stringify(settings) }),
};

// 6. Group (Expanded)
export const groupService = {
  create: (instance: string, subject: string, participants: string[]) => request(`/group/create/${instance}`, { method: 'POST', body: JSON.stringify({ subject, participants }) }),
  fetchAll: (instance: string) => request(`/group/fetchAllGroups/${instance}?getParticipants=true`, { method: 'GET' }),
  participants: (instance: string, groupJid: string) => request(`/group/participants/${instance}?groupJid=${groupJid}`, { method: 'GET' }),
  updateParticipant: (instance: string, groupJid: string, action: 'add'|'remove'|'promote'|'demote', participants: string[]) => request(`/group/updateParticipant/${instance}?groupJid=${groupJid}`, { method: 'POST', body: JSON.stringify({ action, participants }) }),
  inviteCode: (instance: string, groupJid: string) => request(`/group/inviteCode/${instance}?groupJid=${groupJid}`, { method: 'GET' }),
  leave: (instance: string, groupJid: string) => request(`/group/leaveGroup/${instance}?groupJid=${groupJid}`, { method: 'DELETE' }),

  // Extended Group Features
  updateGroupPicture: (instance: string, groupJid: string, image: string) =>
    request(`/group/updateGroupPicture/${instance}?groupJid=${groupJid}`, { method: 'POST', body: JSON.stringify({ image }) }),
  
  updateGroupSubject: (instance: string, groupJid: string, subject: string) =>
    request(`/group/updateGroupSubject/${instance}?groupJid=${groupJid}`, { method: 'POST', body: JSON.stringify({ subject }) }),

  updateGroupDescription: (instance: string, groupJid: string, description: string) =>
    request(`/group/updateGroupDescription/${instance}?groupJid=${groupJid}`, { method: 'POST', body: JSON.stringify({ description }) }),

  revokeInviteCode: (instance: string, groupJid: string) =>
    request(`/group/revokeInviteCode/${instance}?groupJid=${groupJid}`, { method: 'POST' }),

  sendInvite: (instance: string, groupJid: string, description: string, numbers: string[]) =>
    request(`/group/sendInvite/${instance}`, { method: 'POST', body: JSON.stringify({ groupJid, description, numbers }) }),

  updateSetting: (instance: string, groupJid: string, action: 'announcement' | 'not_announcement' | 'locked' | 'unlocked') =>
    request(`/group/updateSetting/${instance}?groupJid=${groupJid}`, { method: 'POST', body: JSON.stringify({ action }) }),

  toggleEphemeral: (instance: string, groupJid: string, expiration: number) =>
    request(`/group/toggleEphemeral/${instance}?groupJid=${groupJid}`, { method: 'POST', body: JSON.stringify({ expiration }) }),
};

// 7. Label Service (New)
export const labelService = {
  findLabels: (instance: string) => request(`/label/findLabels/${instance}`, { method: 'GET' }),
  handleLabel: (instance: string, number: string, labelId: string, action: 'add' | 'remove') =>
    request(`/label/handleLabel/${instance}`, { method: 'POST', body: JSON.stringify({ number, labelId, action }) }),
};

// 8. Integrations (Comprehensive)
export const integrationService = {
  // Webhook
  setWebhook: (instance: string, url: string, enabled: boolean) => request(`/webhook/set/${instance}`, { method: 'POST', body: JSON.stringify({ webhook: { enabled, url, byEvents: false, events: ["MESSAGES_UPSERT", "SEND_MESSAGE", "CONNECTION_UPDATE"] } }) }),
  findWebhook: (instance: string) => request(`/webhook/find/${instance}`, { method: 'GET' }),
  
  // Chatwoot
  chatwoot: {
    set: (instance: string, config: ChatwootConfig) => request(`/chatwoot/set/${instance}`, { method: 'POST', body: JSON.stringify(config) }),
    find: (instance: string) => request(`/chatwoot/find/${instance}`, { method: 'GET' }),
  },

  // Typebot
  typebot: {
    create: (instance: string, config: any) => request(`/typebot/create/${instance}`, { method: 'POST', body: JSON.stringify(config) }),
    find: (instance: string) => request(`/typebot/find/${instance}`, { method: 'GET' }),
    fetch: (instance: string, typebotId: string) => request(`/typebot/fetch/${typebotId}/${instance}`, { method: 'GET' }),
    update: (instance: string, typebotId: string, config: any) => request(`/typebot/update/${typebotId}/${instance}`, { method: 'PUT', body: JSON.stringify(config) }),
    delete: (instance: string, typebotId: string) => request(`/typebot/delete/${typebotId}/${instance}`, { method: 'DELETE' }),
    changeStatus: (instance: string, remoteJid: string, status: 'opened'|'closed'|'paused') => request(`/typebot/changeStatus/${instance}`, { method: 'POST', body: JSON.stringify({ remoteJid, status }) }),
    fetchSessions: (instance: string, typebotId: string) => request(`/typebot/fetchSessions/${typebotId}/${instance}`, { method: 'GET' }),
    settings: (instance: string, config: any) => request(`/typebot/settings/${instance}`, { method: 'POST', body: JSON.stringify(config) }),
    fetchSettings: (instance: string) => request(`/typebot/fetchSettings/${instance}`, { method: 'GET' }),
  },
  
  // OpenAI
  openai: {
    create: (instance: string, config: any) => request(`/openai/create/${instance}`, { method: 'POST', body: JSON.stringify(config) }),
    find: (instance: string) => request(`/openai/find/${instance}`, { method: 'GET' }),
    fetch: (instance: string, openaiId: string) => request(`/openai/fetch/${openaiId}/${instance}`, { method: 'GET' }),
    update: (instance: string, openaiId: string, config: any) => request(`/openai/update/${openaiId}/${instance}`, { method: 'PUT', body: JSON.stringify(config) }),
    delete: (instance: string, openaiId: string) => request(`/openai/delete/${openaiId}/${instance}`, { method: 'DELETE' }),
    changeStatus: (instance: string, remoteJid: string, status: 'opened'|'closed'|'paused') => request(`/openai/changeStatus/${instance}`, { method: 'POST', body: JSON.stringify({ remoteJid, status }) }),
    fetchSessions: (instance: string, openaiId: string) => request(`/openai/fetchSessions/${openaiId}/${instance}`, { method: 'GET' }),
    settings: (instance: string, config: any) => request(`/openai/settings/${instance}`, { method: 'POST', body: JSON.stringify(config) }),
    fetchSettings: (instance: string) => request(`/openai/fetchSettings/${instance}`, { method: 'GET' }),
  },

  // Dify
  dify: {
    create: (instance: string, config: BotIntegrationConfig) => request(`/dify/create/${instance}`, { method: 'POST', body: JSON.stringify(config) }),
    find: (instance: string) => request(`/dify/find/${instance}`, { method: 'GET' }),
    fetch: (instance: string, difyId: string) => request(`/dify/fetch/${difyId}/${instance}`, { method: 'GET' }),
    update: (instance: string, difyId: string, config: BotIntegrationConfig) => request(`/dify/update/${difyId}/${instance}`, { method: 'PUT', body: JSON.stringify(config) }),
    delete: (instance: string, difyId: string) => request(`/dify/delete/${difyId}/${instance}`, { method: 'DELETE' }),
    changeStatus: (instance: string, remoteJid: string, status: 'opened'|'closed'|'paused') => request(`/dify/changeStatus/${instance}`, { method: 'POST', body: JSON.stringify({ remoteJid, status }) }),
    fetchSessions: (instance: string, difyId: string) => request(`/dify/fetchSessions/${difyId}/${instance}`, { method: 'GET' }),
    settings: (instance: string, config: any) => request(`/dify/settings/${instance}`, { method: 'POST', body: JSON.stringify(config) }),
    fetchSettings: (instance: string) => request(`/dify/fetchSettings/${instance}`, { method: 'GET' }),
  },

  // Flowise
  flowise: {
    create: (instance: string, config: BotIntegrationConfig) => request(`/flowise/create/${instance}`, { method: 'POST', body: JSON.stringify(config) }),
    find: (instance: string) => request(`/flowise/find/${instance}`, { method: 'GET' }),
    fetch: (instance: string, flowiseId: string) => request(`/flowise/fetch/${flowiseId}/${instance}`, { method: 'GET' }),
    update: (instance: string, flowiseId: string, config: BotIntegrationConfig) => request(`/flowise/update/${flowiseId}/${instance}`, { method: 'PUT', body: JSON.stringify(config) }),
    delete: (instance: string, flowiseId: string) => request(`/flowise/delete/${flowiseId}/${instance}`, { method: 'DELETE' }),
    changeStatus: (instance: string, remoteJid: string, status: 'opened'|'closed'|'paused') => request(`/flowise/changeStatus/${instance}`, { method: 'POST', body: JSON.stringify({ remoteJid, status }) }),
    fetchSessions: (instance: string, flowiseId: string) => request(`/flowise/fetchSessions/${flowiseId}/${instance}`, { method: 'GET' }),
    settings: (instance: string, config: any) => request(`/flowise/settings/${instance}`, { method: 'POST', body: JSON.stringify(config) }),
    fetchSettings: (instance: string) => request(`/flowise/fetchSettings/${instance}`, { method: 'GET' }),
  },

  // N8N
  n8n: {
    create: (instance: string, config: BotIntegrationConfig) => request(`/n8n/create/${instance}`, { method: 'POST', body: JSON.stringify(config) }),
    find: (instance: string) => request(`/n8n/find/${instance}`, { method: 'GET' }),
    fetch: (instance: string, n8nId: string) => request(`/n8n/fetch/${n8nId}/${instance}`, { method: 'GET' }),
    update: (instance: string, n8nId: string, config: BotIntegrationConfig) => request(`/n8n/update/${n8nId}/${instance}`, { method: 'PUT', body: JSON.stringify(config) }),
    delete: (instance: string, n8nId: string) => request(`/n8n/delete/${n8nId}/${instance}`, { method: 'DELETE' }),
    changeStatus: (instance: string, remoteJid: string, status: 'opened'|'closed'|'paused') => request(`/n8n/changeStatus/${instance}`, { method: 'POST', body: JSON.stringify({ remoteJid, status }) }),
    fetchSessions: (instance: string, n8nId: string) => request(`/n8n/fetchSessions/${n8nId}/${instance}`, { method: 'GET' }),
    settings: (instance: string, config: any) => request(`/n8n/settings/${instance}`, { method: 'POST', body: JSON.stringify(config) }),
    fetchSettings: (instance: string) => request(`/n8n/fetchSettings/${instance}`, { method: 'GET' }),
  },

  // EvoAI
  evoai: {
    create: (instance: string, config: BotIntegrationConfig) => request(`/evoai/create/${instance}`, { method: 'POST', body: JSON.stringify(config) }),
    find: (instance: string) => request(`/evoai/find/${instance}`, { method: 'GET' }),
    fetch: (instance: string, evoaiId: string) => request(`/evoai/fetch/${evoaiId}/${instance}`, { method: 'GET' }),
    update: (instance: string, evoaiId: string, config: BotIntegrationConfig) => request(`/evoai/update/${evoaiId}/${instance}`, { method: 'PUT', body: JSON.stringify(config) }),
    delete: (instance: string, evoaiId: string) => request(`/evoai/delete/${evoaiId}/${instance}`, { method: 'DELETE' }),
    changeStatus: (instance: string, remoteJid: string, status: 'opened'|'closed'|'paused') => request(`/evoai/changeStatus/${instance}`, { method: 'POST', body: JSON.stringify({ remoteJid, status }) }),
    fetchSessions: (instance: string, evoaiId: string) => request(`/evoai/fetchSessions/${evoaiId}/${instance}`, { method: 'GET' }),
    settings: (instance: string, config: any) => request(`/evoai/settings/${instance}`, { method: 'POST', body: JSON.stringify(config) }),
    fetchSettings: (instance: string) => request(`/evoai/fetchSettings/${instance}`, { method: 'GET' }),
  },
};

// 9. Raw & Label
export const rawService = {
  execute: (method: string, endpoint: string, body?: any) => request(endpoint, { method, body: body ? JSON.stringify(body) : undefined })
};