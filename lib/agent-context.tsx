"use client";

import { createContext, useContext, useState, ReactNode } from 'react';

// Mock data for agents
const agents = [
  { id: 1, name: 'Agent Smith' },
  { id: 2, name: 'Agent 99' },
  { id: 3, name: 'Agent Bond' },
];

interface Agent {
  id: number;
  name: string;
}

interface AgentContextType {
  selectedAgent: Agent | null;
  setSelectedAgent: (agent: Agent | null) => void;
  agents: Agent[];
}

const AgentContext = createContext<AgentContextType | undefined>(undefined);

export function AgentProvider({ children }: { children: ReactNode }) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(agents[0]);

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
