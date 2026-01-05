import React from 'react';
import { 
  Server, 
  MessageSquare, 
  Users, 
  Settings, 
  Webhook, 
  Activity,
  Smartphone,
  Terminal,
  Shield,
  Tag
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'instances', label: 'Instances', icon: Server },
    { id: 'messaging', label: 'Messaging', icon: MessageSquare },
    { id: 'groups', label: 'Groups', icon: Users },
    { id: 'labels', label: 'Labels', icon: Tag },
    { id: 'chat-utils', label: 'Chat Utils', icon: Smartphone },
    { id: 'integrations', label: 'Integrations', icon: Webhook },
    { id: 'proxy', label: 'Proxy Manager', icon: Shield },
    { id: 'postman', label: 'Postman', icon: Terminal },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-card h-screen flex flex-col border-r border-slate-700 fixed left-0 top-0">
      <div className="p-6 border-b border-slate-700 flex items-center gap-2">
        <Activity className="text-primary w-8 h-8" />
        <h1 className="text-xl font-bold text-white tracking-tight">EvoManager</h1>
      </div>
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-primary/20 text-primary border border-primary/30' 
                  : 'text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
        v2.3.* Integration
      </div>
    </div>
  );
};

export default Sidebar;