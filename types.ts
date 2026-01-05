export interface Instance {
  instance: {
    instanceName: string;
    owner: string;
    profileName: string;
    profilePictureUrl: string;
    profileStatus: string;
    status: string;
    serverUrl: string;
    apikey: string;
  };
  hash: {
    apikey: string;
  };
}

export interface ConnectResponse {
  instance: string;
  base64: string;
  code: string;
}

export interface ApiError {
  error: string;
  message: string | string[];
  statusCode: number;
}

export interface GlobalConfig {
  apiKey: string;
  serverUrl: string;
}

export interface ProxyConfig {
  enabled: boolean;
  host: string;
  port: string;
  protocol: string;
  username?: string;
  password?: string;
}

// --- Integrations Configs ---

export interface TypebotConfig {
  enabled: boolean;
  url: string;
  typebot: string;
  triggerType: string;
  triggerOperator: string;
  triggerValue: string;
  expire: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
}

export interface OpenAIConfig {
  enabled: boolean;
  openaiCredsId: string;
  model: string;
  maxTokens: number;
  triggerType: string;
  triggerValue: string;
  expire: number;
  keywordFinish: string;
}

export interface ChatwootConfig {
  enabled: boolean;
  accountId: string;
  token: string;
  url: string;
  signMsg: boolean;
  reopenConversation: boolean;
  conversationPending: boolean;
  nameInbox: string;
  mergeBrazilContacts: boolean;
  importContacts: boolean;
  importMessages: boolean;
  daysLimitImportMessages: number;
  signDelimiter: string;
  autoCreate: boolean;
  organization: string;
  logo: string;
  ignoreJids: string[];
}

// Generic Interface for Dify, Flowise, N8N, EvoAI configs
export interface BotIntegrationConfig {
  enabled: boolean;
  apiUrl: string;
  apiKey?: string;
  botType?: string; // Specific to Dify (chatBot, textGenerator, agent, workflow)
  triggerType: string;
  triggerOperator: string;
  triggerValue: string;
  expire: number;
  keywordFinish: string;
  delayMessage: number;
  unknownMessage: string;
  listeningFromMe: boolean;
  stopBotFromMe: boolean;
  keepOpen: boolean;
  debounceTime: number;
  ignoreJids: string[];
}

// --- Message Components ---

export interface Button {
  type: 'reply' | 'call' | 'url' | 'copy';
  displayText: string;
  id?: string; // for reply
  phoneNumber?: string; // for call
  url?: string; // for url
  copyCode?: string; // for copy
}

export interface ListRow {
  title: string;
  description: string;
  rowId: string;
}

export interface ListSection {
  title: string;
  rows: ListRow[];
}

export interface TemplateComponent {
  type: 'body' | 'header' | 'footer' | 'button';
  sub_type?: 'url' | 'quick_reply';
  index?: string;
  parameters: Array<{
    type: 'text' | 'image' | 'video' | 'document';
    text?: string;
    image?: { link: string };
  }>;
}

export enum MessageType {
  Text = 'sendText',
  Media = 'sendMedia',
  Audio = 'sendWhatsAppAudio',
  Voice = 'sendPtv', // Video note
  Sticker = 'sendSticker',
  Location = 'sendLocation',
  Contact = 'sendContact',
  Reaction = 'sendReaction',
  Poll = 'sendPoll',
  Buttons = 'sendButtons',
  List = 'sendList',
  Template = 'sendTemplate'
}

export interface GenericResponse {
  [key: string]: any;
}
