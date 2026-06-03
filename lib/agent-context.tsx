"use client";
import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { createClient } from './supabase/client';
import { Database } from './supabase/database.types';

type Agent = Database['public']['Tables']['agents']['Row'] & { firewall_enabled?: boolean; };

interface AgentContextType {
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  agents: Agent[];
  refreshAgents: () => Promise<void>;
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);
const STORAGE_KEY = 'hidps_selected_agent_id';

export function AgentProvider({ children }: { children: ReactNode }) {
  const [selectedAgent, setSelectedAgentState] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const hasInitialized = useRef(false);
  const supabase = createClient();

  const setSelectedAgent = (agent: Agent | null) => {
    setSelectedAgentState(agent);
    if (typeof window !== 'undefined') {
      if (agent) {
        localStorage.setItem(STORAGE_KEY, agent.id);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const fetchAgents = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setAgents([]);
      setSelectedAgentState(null);
      return;
    }

    const { data, error } = await supabase.from('agents').select('*');
    if (error) {
      console.error('Error fetching agents:', error);
      setAgents([]);
    } else if (data) {
      setAgents(data);

      // Only set initial agent once — never override user's manual selection
      if (!hasInitialized.current) {
        hasInitialized.current = true;
        const savedId = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
        const savedAgent = savedId ? data.find(a => a.id === savedId) : null;
        setSelectedAgentState(savedAgent || data[0] || null);
      }
    }
  };

  useEffect(() => {
    fetchAgents();

    const channel = supabase
      .channel('agents_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'agents' }, () => {
        fetchAgents();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <AgentContext.Provider value={{ selectedAgent, setSelectedAgent, agents, refreshAgents: fetchAgents }}>
      {children}
    </AgentContext.Provider>
  );
}

export function useAgent() {
  const context = useContext(AgentContext);
  if (context === undefined) {
    throw new Error('useAgent must be used within an AgentProvider');
  }
  return context;
}