"use client";
import { Plus, UserPlus, Shield, Download } from 'lucide-react';
import AgentSelector from '@/components/AgentSelector';
import { useAgent } from '@/lib/agent-context';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';

export default function AgentsPage() {
  const { agents, selectedAgent } = useAgent();
  const [user, setUser] = useState<User | null>(null);
  const [agentStats, setAgentStats] = useState<Map<string, { is_installed: boolean, created_at: string }>>(new Map());
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    }
    getUser();
  }, [supabase]);

  useEffect(() => {
    const fetchAgentStats = async () => {
      const { data, error } = await supabase
        .from('agent_stats')
        .select('agent_id, is_installed, created_at')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching agent stats:', error);
      } else {
        const statsMap = new Map(
          data.map(stat => [stat.agent_id, {
            is_installed: stat.is_installed,
            created_at: stat.created_at
          }])
        );
        setAgentStats(statsMap);
      }
    };
    fetchAgentStats();
  }, []);

  const isOnline = (createdAt: string) => {
    const lastSeen = new Date(createdAt).getTime();
    const now = new Date().getTime();
    return (now - lastSeen) < 2 * 60 * 1000; // 2 minutes
  };

  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-bold text-white">Agents</h2>
          {selectedAgent && <span className="text-slate-400">({selectedAgent.name} selected)</span>}
        </div>
        <div className="flex items-center gap-4">
          <AgentSelector />
          <Link href="/agent-setup" className="flex items-center gap-2 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600">
            <Plus size={20} />
            Add Agent
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => {
          const stats = agentStats.get(agent.id);
          const isInstalled = stats?.is_installed || false;
          const online = stats ? isOnline(stats.created_at) : false;

          return (
            <div key={agent.id} className="bg-slate-900 p-6 rounded-xl border border-slate-800 fle