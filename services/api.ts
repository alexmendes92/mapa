import { API_KEY, SERVER_URL } from '../constants';

const getHeaders = (customKey?: string) => ({
  'Content-Type': 'application/json',
  'apikey': customKey || API_KEY
});

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${SERVER_URL}${endpoint}`;
  const config = {
    ...options,
    headers: { ...getHeaders(), ...options.headers },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({})); 
    if (!response.ok) throw new Error(data.message || data.error || `Error ${response.status}`);
    return data as T;
  } catch (error: any) {
    console.error(`API Error on ${url}:`, error);
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

// 4. Send Message
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
};

// 5. Chat & Profile
export const chatService = {
  checkNumber: (instance: string, number: string) => request(`/chat/whatsappNumbers/${instance}`, { method: 'POST', body: JSON.stringify({ numbers: [number] }) }),
  markRead: (instance: string, remoteJid: string, id: string, fromMe: boolean) => request(`/chat/markMessageAsRead/${instance}`, { method: 'POST', body: JSON.stringify({ readMessages: [{ remoteJid, fromMe, id }] }) }),
  archiveChat: (instance: string, chat: string, archive: boolean) => request(`/chat/archiveChat/${instance}`, { method: 'POST', body: JSON.stringify({ chat, archive }) }),
  deleteMessage: (instance: string, remoteJid: string, id: string, fromMe: boolean) => request(`/chat/deleteMessageForEveryone/${instance}`, { method: 'DELETE', body: JSON.stringify({ remoteJid, id, fromMe }) }),
  getProfilePicture: (instance: string, number: string) => request(`/chat/fetchProfilePictureUrl/${instance}`, { method: 'POST', body: JSON.stringify({ number }) }),
  updateBlockStatus: (instance: string, number: string, status: 'block' | 'unblock') => request(`/message/updateBlockStatus/${instance}`, { method: 'POST', body: JSON.stringify({ number, status }) }),
  findChats: (instance: string) => request(`/chat/findChats/${instance}`, { method: 'POST', body: JSON.stringify({}) }),
  // Profile
  updateName: (instance: string, name: string) => request(`/chat/updateProfileName/${instance}`, { method: 'POST', body: JSON.stringify({ name }) }),
  updateStatus: (instance: string, status: string) => request(`/chat/updateProfileStatus/${instance}`, { method: 'POST', body: JSON.stringify({ status }) }),
  updatePicture: (instance: string, picture: string) => request(`/chat/updateProfilePicture/${instance}`, { method: 'POST', body: JSON.stringify({ picture }) }),
  removePicture: (instance: string) => request(`/chat/removeProfilePicture/${instance}`, { method: 'DELETE' }),
  fetchPrivacy: (instance: string) => request(`/chat/fetchPrivacySettings/${instance}`, { method: 'GET' }),
  updatePrivacy: (instance: string, settings: any) => request(`/chat/updatePrivacySettings/${instance}`, { method: 'POST', body: JSON.stringify(settings) }),
};

// 6. Group
export const groupService = {
  create: (instance: string, subject: string, participants: string[]) => request(`/group/create/${instance}`, { method: 'POST', body: JSON.stringify({ subject, participants }) }),
  fetchAll: (instance: string) => request(`/group/fetchAllGroups/${instance}?getParticipants=true`, { method: 'GET' }),
  participants: (instance: string, groupJid: string) => request(`/group/participants/${instance}?groupJid=${groupJid}`, { method: 'GET' }),
  updateParticipant: (instance: string, groupJid: string, action: 'add'|'remove'|'promote'|'demote', participants: string[]) => request(`/group/updateParticipant/${instance}?groupJid=${groupJid}`, { method: 'POST', body: JSON.stringify({ action, participants }) }),
  inviteCode: (instance: string, groupJid: string) => request(`/group/inviteCode/${instance}?groupJid=${groupJid}`, { method: 'GET' }),
  leave: (instance: string, groupJid: string) => request(`/group/leaveGroup/${instance}?groupJid=${groupJid}`, { method: 'DELETE' }),
};

// 7. Integrations (Typebot, OpenAI, Webhook)
export const integrationService = {
  // Webhook
  setWebhook: (instance: string, url: string, enabled: boolean) => request(`/webhook/set/${instance}`, { method: 'POST', body: JSON.stringify({ webhook: { enabled, url, byEvents: false, events: ["MESSAGES_UPSERT", "SEND_MESSAGE", "CONNECTION_UPDATE"] } }) }),
  findWebhook: (instance: string) => request(`/webhook/find/${instance}`, { method: 'GET' }),
  
  // Typebot
  createTypebot: (instance: string, config: any) => request(`/typebot/create/${instance}`, { method: 'POST', body: JSON.stringify(config) }),
  findTypebot: (instance: string) => request(`/typebot/find/${instance}`, { method: 'GET' }),
  toggleTypebot: (instance: string, remoteJid: string, status: 'opened'|'closed'|'paused') => request(`/typebot/changeStatus/${instance}`, { method: 'POST', body: JSON.stringify({ remoteJid, status }) }),
  
  // OpenAI
  createOpenAI: (instance: string, config: any) => request(`/openai/create/${instance}`, { method: 'POST', body: JSON.stringify(config) }),
  findOpenAI: (instance: string) => request(`/openai/find/${instance}`, { method: 'GET' }),
};

// 8. Raw & Label
export const rawService = {
  execute: (method: string, endpoint: string, body?: any) => request(endpoint, { method, body: body ? JSON.stringify(body) : undefined })
};
