"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { createClient } from './supabase/client';
import { Database } from './supabase/database.types';

type Agent = Database['public']['Tables']['agents']['Row'];

interface AgentContextType {
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  agents: Agent[];
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const fetchAgents = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        return;
      }
      const { data, error } = await supabase.from('agents').select('*');
      if (error) {
        console.error('Error fetching agents:', error);
      } else if (data) {
        setAgents(data);
        if (data.length > 0) {
          setSelectedAgent(data[0]);
        }
      }
    };

    fetchAgents();
  }, [supabase]);

  return (
    <AgentContext.Provider value={{ selectedAgent, setSelectedAgent, agents }}>
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
