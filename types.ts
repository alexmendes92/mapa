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
}

export interface GenericResponse {
  [key: string]: any;
}
