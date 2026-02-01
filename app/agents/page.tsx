"use client";
import { Plus, UserPlus, Shield } from 'lucide-react';
import AgentSelector from '@/components/AgentSelector';
import { useAgent } from '@/lib/agent-context';
import Link from 'next/link';

// --- MOCK DATA ---
const currentUser = { id: 1, name: 'User 1' };

const agents = [
  { id: 1, name: 'Agent Smith', ownerId: 1, ownerName: 'User 1' },
  { id: 2, name: 'Agent 99', ownerId: 2, ownerName: 'User 2' },
  { id: 3, name: 'Agent Bond', ownerId: 1, ownerName: 'User 1' },
];

// --- MAIN AGENTS COMPONENT ---
export default function AgentsPage() {
  const { selectedAgent } = useAgent();
  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-white">Agents</h2>
          {selectedAgent && <span className="text-slate-400">({selectedAgent.name} selected)</span>}
        </div>
        <div className="flex items-center gap-4">
          <AgentSelector />
          <button className="flex items-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
            <Plus size={20} />
            Add Agent
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div key={agent.id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Shield size={24} className="text-slate-400" />
                <h3 className="text-xl font-bold text-white">{agent.name}</h3>
              </div>
              <p className="text-slate-400">Owner: {agent.ownerName}</p>
            </div>
            <div className="mt-6">
              {currentUser.id === agent.ownerId && (
                <Link href={`/agents/${agent.id}/add-user`} className="flex items-center gap-2 w-full justify-center bg-slate-800 text-slate-300 py-2 px-4 rounded-lg hover:bg-slate-700">
                  <UserPlus size={18} />
                  Add Users
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
