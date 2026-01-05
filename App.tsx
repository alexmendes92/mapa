import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import InstanceList from './components/InstanceList';
import MessageForm from './components/MessageForm';
import GroupManager from './components/GroupManager';
import LabelManager from './components/LabelManager';
import Integrations from './components/Integrations';
import Postman from './components/Postman';
import Settings from './components/Settings';
import ChatUtils from './components/ChatUtils';
import ProxyManager from './components/ProxyManager';
import { instanceService } from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('instances');
  const [instances, setInstances] = useState<any[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);
  const [loadingInstances, setLoadingInstances] = useState(false);

  const fetchInstances = async () => {
    setLoadingInstances(true);
    try {
      const data: any = await instanceService.fetchInstances();
      console.log("Raw Instances Data:", data);

      let validList: any[] = [];
      
      // Handle various API response structures
      if (Array.isArray(data)) {
        validList = data;
      } else if (data && Array.isArray(data.data)) {
        validList = data.data;
      } else if (data && Array.isArray(data.instance)) {
        validList = data.instance;
      } else if (data && Array.isArray(data.instances)) {
         validList = data.instances;
      }

      setInstances(validList);
    } catch (error) {
      console.error("Failed to fetch instances", error);
      setInstances([]);
    } finally {
      setLoadingInstances(false);
    }
  };

  useEffect(() => {
    fetchInstances();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case 'instances':
        return <InstanceList instances={instances} refreshInstances={fetchInstances} isLoading={loadingInstances} />;
      case 'messaging':
        return <MessageForm selectedInstance={selectedInstance} />;
      case 'groups':
        return <GroupManager selectedInstance={selectedInstance} />;
      case 'labels':
        return <LabelManager selectedInstance={selectedInstance} />;
      case 'integrations':
        return <Integrations selectedInstance={selectedInstance} />;
      case 'postman':
        return <Postman selectedInstance={selectedInstance} instances={instances} />;
      case 'settings':
        return <Settings selectedInstance={selectedInstance} />;
      case 'chat-utils':
        return <ChatUtils selectedInstance={selectedInstance} />;
      case 'proxy':
        return <ProxyManager selectedInstance={selectedInstance} />;
      default:
        return <div className="text-center text-slate-500 mt-20">Select a tab</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-dark">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 ml-64 flex flex-col">
        <Header 
          instances={instances}
          selectedInstance={selectedInstance}
          setSelectedInstance={setSelectedInstance}
          onRefresh={fetchInstances}
          isLoading={loadingInstances}
        />
        <main className="flex-1 p-8 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;