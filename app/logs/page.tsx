"use client";
import { useState } from 'react';
import { BookText, Shield, Users, FileWarning, Bell, BarChart, UserCircle, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';
import AgentSelector from '@/components/AgentSelector';
import { useAgent } from '@/lib/agent-context';

// --- MOCK DATA ---
const getInitialLogs = (agentName: string) => [
  { id: 1, type: 'Login', service: 'sshd', timestamp: '2026-02-01T10:30:00Z', message: `Accepted publickey for user 'admin' from 192.168.1.109 on ${agentName}` },
  { id: 2, type: 'Firewall', service: 'kernel', timestamp: '2026-02-01T10:29:55Z', message: 'Firewall: *TCP_IN Blocked* IN=eth0 OUT= MAC=... SRC=103.22.11.4 DST=... LEN=40' },
  { id: 3, type: 'File Monitoring', service: 'sentinel-agent', timestamp: '2026-02-01T10:28:10Z', message: `File integrity check passed for '/etc/shadow' on ${agentName}.` },
  { id: 4, type: 'Process', service: 'systemd', timestamp: '2026-02-01T10:27:00Z', message: 'Started session c5 of user `admin`.' },
  { id: 5, type: 'Login', service: 'sudo', timestamp: '2026-02-01T10:25:00Z', message: 'user : TTY=pts/0 ; PWD=/home/user ; USER=root ; COMMAND=/usr/bin/apt update' },
  { id: 6, type: 'Firewall', service: 'kernel', timestamp: '2026-02-01T10:24:30Z', message: 'Firewall: *UDP_OUT Allow* IN= OUT=eth0 SRC=... DST=8.8.8.8 LEN=57' },
];

const logTypes = [
    { name: 'All', icon: BookText },
    { name: 'Firewall', icon: Shield },
    { name: 'Login', icon: Users },
    { name: 'File Monitoring', icon: FileWarning },
    { name: 'Process', icon: Bell },
];

// --- MAIN LOGS PAGE COMPONENT ---
export default function LogsPage() {
  const { selectedAgent } = useAgent();
  const initialLogs = selectedAgent ? getInitialLogs(selectedAgent.name) : [];
  const [logs, setLogs] = useState(initialLogs);
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredLogs = activeFilter === 'All' ? logs : logs.filter(l => l.type === activeFilter);

  return (
    <>
      {/* Main Content */}
      
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">System Logs</h2>
            <p className="text-slate-400">Review raw event logs from the Sentinel agent and system services.</p>
          </div>
          <AgentSelector />
        </header>

        {/* Filter Tabs */}
        <div className="flex items-center border-b border-slate-800 mb-6">
            {logTypes.map(type => (
                <button 
                    key={type.name}
                    onClick={() => setActiveFilter(type.name)}
                    className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-medium transition-colors
                        ${activeFilter === type.name 
                            ? 'border-blue-500 text-blue-400' 
                            : 'border-transparent text-slate-500 hover:text-slate-300'}`
                    }
                >
                    <type.icon size={16} />
                    {type.name}
                </button>
            ))}
        </div>

        {/* Logs Table */}
        <div className="bg-slate-900 rounded-xl border border-slate-800">
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-slate-800 text-sm text-slate-400">
                            <th className="p-4">Timestamp</th>
                            <th className="p-4">Service</th>
                            <th className="p-4">Message</th>
                            <th className="p-4">Type</th>
                        </tr>
                    </thead>
                    <tbody className="font-mono text-sm">
                        {filteredLogs.map(log => (
                            <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                <td className="p-4 text-cyan-400">{log.service}</td>
                                <td className="p-4 text-slate-300">{log.message}</td>
                                <td className="p-4">
                                    <span className="px-2 py-1 rounded-full text-xs bg-slate-700 text-slate-300">{log.type}</span>
                                 </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {filteredLogs.length === 0 && <p className="p-4 text-slate-500">No logs for this category.</p>}
            </div>
        </div>
      
    </>
  );
}
