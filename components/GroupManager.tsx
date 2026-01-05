import React, { useState, useEffect } from 'react';
import { groupService } from '../services/api';
import { Users, RefreshCw } from 'lucide-react';

interface GroupManagerProps {
  selectedInstance: string | null;
}

const GroupManager: React.FC<GroupManagerProps> = ({ selectedInstance }) => {
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [newGroupSubject, setNewGroupSubject] = useState('');

  const fetchGroups = async () => {
    if (!selectedInstance) return;
    setLoading(true);
    try {
        const data = await groupService.fetchAll(selectedInstance);
        setGroups(Array.isArray(data) ? data : []);
    } catch (error) {
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedInstance]);

  const createGroup = async () => {
      if (!selectedInstance || !newGroupSubject) return;
      try {
          await groupService.create(selectedInstance, newGroupSubject, []);
          setNewGroupSubject('');
          fetchGroups();
          alert('Group created!');
      } catch (e) {
          alert('Error creating group');
      }
  };

  if (!selectedInstance) return <div className="text-center text-slate-500 mt-20">Select an instance to manage groups.</div>;

  return (
    <div className="space-y-6">
        <div className="bg-card p-6 rounded-lg border border-slate-700">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Users className="text-primary" /> Group Management
            </h2>
            <div className="flex gap-4 mb-8">
                <input 
                    className="flex-1 bg-dark border border-slate-600 rounded px-3 py-2 text-white focus:border-primary outline-none"
                    placeholder="New Group Subject"
                    value={newGroupSubject}
                    onChange={e => setNewGroupSubject(e.target.value)}
                />
                <button 
                    onClick={createGroup}
                    className="bg-primary text-darker font-bold px-4 py-2 rounded hover:bg-emerald-600"
                >
                    Create Group
                </button>
                 <button 
                    onClick={fetchGroups}
                    className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600"
                >
                    <RefreshCw size={18} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {groups.map((group: any) => (
                    <div key={group.id} className="bg-dark p-4 rounded border border-slate-800 flex items-center justify-between">
                        <div>
                            <h3 className="font-bold">{group.subject}</h3>
                            <p className="text-xs text-slate-500">{group.id}</p>
                            <p className="text-xs text-slate-400">{group.size || 0} participants</p>
                        </div>
                    </div>
                ))}
                {groups.length === 0 && !loading && (
                    <p className="text-slate-500 col-span-full text-center">No groups found.</p>
                )}
            </div>
        </div>
    </div>
  );
};

export default GroupManager;
