import React, { useState, useEffect, useRef } from 'react';
import { chatService, messageService } from '../services/api';
import { Search, Send, User, MoreVertical, Paperclip, Check, CheckCheck, RefreshCw } from 'lucide-react';

interface LiveChatProps {
  selectedInstance: string | null;
}

const LiveChat: React.FC<LiveChatProps> = ({ selectedInstance }) => {
  const [chats, setChats] = useState<any[]>([]);
  const [filteredChats, setFilteredChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 1. Fetch Chats
  const fetchChats = async () => {
    if (!selectedInstance) return;
    setLoadingChats(true);
    try {
      const data: any = await chatService.findChats(selectedInstance);
      // Determine array source based on API version structure
      const list = Array.isArray(data) ? data : (data.chats || data.data || []);
      
      // Sort by latest message
      const sorted = list.sort((a: any, b: any) => (b.date || 0) - (a.date || 0));
      
      setChats(sorted);
      setFilteredChats(sorted);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setLoadingChats(false);
    }
  };

  useEffect(() => {
    fetchChats();
    // Set up a poller interval for new chats every 30s
    const interval = setInterval(fetchChats, 30000);
    return () => clearInterval(interval);
  }, [selectedInstance]);

  // 2. Filter Chats
  useEffect(() => {
    if (!searchTerm) {
      setFilteredChats(chats);
    } else {
      const lower = searchTerm.toLowerCase();
      setFilteredChats(chats.filter(c => 
        (c.name || '').toLowerCase().includes(lower) || 
        (c.id || '').includes(lower)
      ));
    }
  }, [searchTerm, chats]);

  // 3. Fetch Messages when Chat Selected
  const fetchMessages = async (remoteJid: string) => {
    if (!selectedInstance || !remoteJid) return;
    setLoadingMessages(true);
    try {
      // Find 50 messages
      const data: any = await chatService.findMessages(selectedInstance, remoteJid, 1, 50);
      let msgs: any[] = [];
      
      if (Array.isArray(data)) {
        msgs = data;
      } else if (data && Array.isArray(data.messages)) {
        msgs = data.messages;
      } else if (data && Array.isArray(data.data)) {
        msgs = data.data;
      }
      
      // Reverse to show oldest at top, newest at bottom
      setMessages(msgs.reverse());
      scrollToBottom();
    } catch (error) {
      console.error("Error fetching messages:", error);
      setMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSelectChat = (chat: any) => {
    // Only select if valid ID exists to prevent 400 Bad Request
    if (!chat || !chat.id) {
        console.warn('Chat object missing ID:', chat);
        return;
    }
    setSelectedChat(chat);
    fetchMessages(chat.id);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  // 4. Send Message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstance || !selectedChat || !inputMessage.trim()) return;

    const tempMsg = {
      key: { id: 'temp-' + Date.now(), fromMe: true },
      message: { conversation: inputMessage },
      messageTimestamp: Date.now() / 1000,
      pushName: 'Me'
    };

    // Optimistic UI update
    setMessages([...messages, tempMsg]);
    setInputMessage('');
    scrollToBottom();

    try {
      await messageService.sendText(selectedInstance, selectedChat.id, tempMsg.message.conversation);
      // Refresh messages after a short delay to get the real ID/status
      setTimeout(() => {
        if (selectedChat?.id) fetchMessages(selectedChat.id);
      }, 1500);
    } catch (error) {
      console.error("Failed to send", error);
      alert('Failed to send message');
    }
  };

  // Helper to extract text content safely
  const getMessageContent = (msg: any) => {
    if (!msg.message) return '[Unknown Message Type]';
    return msg.message.conversation || 
           msg.message.extendedTextMessage?.text || 
           msg.message.imageMessage?.caption || 
           (msg.message.imageMessage ? '[Image]' : '') ||
           (msg.message.audioMessage ? '[Audio]' : '') ||
           (msg.message.videoMessage ? '[Video]' : '') ||
           (msg.message.stickerMessage ? '[Sticker]' : '') ||
           '';
  };

  if (!selectedInstance) return <div className="flex items-center justify-center h-full text-slate-500">Select an instance to view chats.</div>;

  return (
    <div className="flex h-[calc(100vh-140px)] bg-card rounded-lg border border-slate-700 overflow-hidden">
      
      {/* Left Sidebar: Contact List */}
      <div className="w-1/3 border-r border-slate-700 flex flex-col bg-darker">
        {/* Header */}
        <div className="p-4 bg-card border-b border-slate-700 flex justify-between items-center">
          <h2 className="font-bold text-white">Chats</h2>
          <button onClick={fetchChats} className="text-slate-400 hover:text-white"><RefreshCw size={18} className={loadingChats ? 'animate-spin' : ''}/></button>
        </div>
        
        {/* Search */}
        <div className="p-3">
          <div className="relative">
            <input 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search or start new chat" 
              className="w-full bg-slate-800 text-sm text-white rounded-md pl-10 pr-4 py-2 outline-none focus:ring-1 focus:ring-primary"
            />
            <Search size={16} className="absolute left-3 top-2.5 text-slate-500" />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {filteredChats.length === 0 && !loadingChats && (
            <div className="text-center text-slate-500 mt-10 text-sm">No conversations found.</div>
          )}
          
          {filteredChats.map((chat) => (
            <div 
              key={chat.id || Math.random()} 
              onClick={() => handleSelectChat(chat)}
              className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-slate-800 transition-colors border-b border-slate-800/50 ${selectedChat?.id === chat.id ? 'bg-slate-800 border-l-4 border-l-primary' : ''}`}
            >
              <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden flex-shrink-0">
                {chat.profilePictureUrl ? (
                  <img src={chat.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <User size={24} className="text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline">
                  {/* Fixed potential null split error */}
                  <h3 className="font-medium text-white truncate text-sm">{chat.name || chat.pushName || (chat.id ? chat.id.split('@')[0] : 'Unknown')}</h3>
                  {chat.date && <span className="text-[10px] text-slate-500">{new Date(chat.date * 1000).toLocaleDateString()}</span>}
                </div>
                <p className="text-xs text-slate-400 truncate mt-1">
                  {/* Attempt to show last message preview if available in chat object */}
                  {chat.lastMessage ? getMessageContent({ message: chat.lastMessage }) : 'Click to view messages'}
                </p>
              </div>
              {chat.unreadCount > 0 && (
                <div className="bg-primary text-darker text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {chat.unreadCount}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Conversation */}
      {selectedChat ? (
        <div className="flex-1 flex flex-col bg-[#0b141a]"> {/* WhatsApp Dark BG color */}
          
          {/* Header */}
          <div className="p-3 bg-card border-b border-slate-700 flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-700 overflow-hidden">
                  {selectedChat.profilePictureUrl ? (
                    <img src={selectedChat.profilePictureUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-slate-400 m-2.5" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{selectedChat.name || selectedChat.id}</h3>
                  <span className="text-xs text-slate-400">{selectedChat.id}</span>
                </div>
             </div>
             <button className="text-slate-400 hover:text-white"><MoreVertical size={20} /></button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-opacity-5" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png")', backgroundBlendMode: 'overlay', backgroundColor: '#0f172a' }}>
            {loadingMessages ? (
               <div className="flex justify-center mt-10"><RefreshCw className="animate-spin text-primary" /></div>
            ) : (
              messages.map((msg, idx) => {
                const isMe = msg.key?.fromMe;
                const content = getMessageContent(msg);
                
                return (
                  <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] rounded-lg p-2 relative shadow-sm text-sm ${isMe ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-white rounded-tl-none'}`}>
                      {/* Name of sender in group chats */}
                      {!isMe && msg.pushName && <div className="text-[10px] font-bold text-orange-400 mb-1">{msg.pushName}</div>}
                      
                      <p className="whitespace-pre-wrap break-words">{content}</p>
                      
                      <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                         <span className="text-[10px]">{msg.messageTimestamp ? new Date(msg.messageTimestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                         {isMe && (
                           <span className="text-blue-400">
                             {/* Simple checkmark simulation */}
                             {msg.status === 'READ' ? <CheckCheck size={12}/> : <Check size={12}/>}
                           </span>
                         )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSendMessage} className="p-3 bg-card flex items-center gap-2 border-t border-slate-700">
             <button type="button" className="text-slate-400 hover:text-white p-2"><Paperclip size={20} /></button>
             <input 
               value={inputMessage}
               onChange={e => setInputMessage(e.target.value)}
               className="flex-1 bg-slate-800 text-white rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-primary"
               placeholder="Type a message"
             />
             <button type="submit" disabled={!inputMessage.trim()} className="bg-primary text-darker p-2 rounded-full hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed">
               <Send size={20} />
             </button>
          </form>

        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center bg-darker border-l border-slate-700 text-slate-500">
           <div className="w-64 h-64 opacity-20 bg-no-repeat bg-center" style={{ backgroundImage: 'url("https://static.whatsapp.net/rsrc.php/v3/yO/r/FsWUqRoOsda.png")' }}></div>
           <h2 className="text-2xl font-light text-slate-400 mt-4">WhatsApp Web</h2>
           <p className="text-sm mt-2">Send and receive messages without keeping your phone online.</p>
        </div>
      )}
    </div>
  );
};

export default LiveChat;