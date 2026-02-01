"use client";
import { useState } from 'react';
import { FileWarning, Plus, Trash2 } from 'lucide-react';
import AgentSelector from '@/components/AgentSelector';
import { useAgent } from '@/lib/agent-context';

// --- MOCK DATA ---
interface File {
  id: number;
  path: string;
  added: string;
}

interface Log {
  id: number;
  timestamp: string;
  message: string;
}

const initialMonitoredFiles: File[] = [
  { id: 1, path: '/etc/passwd', added: '2026-01-15T14:00:00Z' },
  { id: 2, path: '/etc/shadow', added: '2026-01-15T14:00:00Z' },
  { id: 3, path: '/var/log/auth.log', added: '2026-01-20T11:30:00Z' },
];

const getFileLogs = (agentName: string): Log[] => [
    { id: 1, timestamp: '2026-02-01T09:55:00Z', message: `ALERT: Integrity check failed for '/etc/passwd' on ${agentName}. Hash mismatch.`},
    { id: 2, timestamp: '2026-02-01T08:00:00Z', message: `OK: Integrity check passed for '/etc/shadow' on ${agentName}.`},
    { id: 3, timestamp: '2026-02-01T07:55:00Z', message: `OK: Integrity check passed for '/etc/passwd' on ${agentName}.`},
];

// --- MAIN FILE MONITORING PAGE COMPONENT ---
export default function FileMonitoringPage() {
  const { selectedAgent } = useAgent();
  const [monitoredFiles, setMonitoredFiles] = useState<File[]>(initialMonitoredFiles);
  const [newFilePath, setNewFilePath] = useState('');
  const fileLogs = selectedAgent ? getFileLogs(selectedAgent.name) : [];

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFilePath.trim() === '') return;

    const newFile: File = {
      id: Date.now(),
      path: newFilePath.trim(),
      added: new Date().toISOString(),
    };

    setMonitoredFiles([newFile, ...monitoredFiles]);
    setNewFilePath('');
    // In a real app, this would trigger a backend API call and generate an alert.
    console.log(`ALERT on ${selectedAgent?.name}: New file '${newFile.path}' added to monitoring.`);
  };

  const handleRemoveFile = (id: number, path: string) => {
    setMonitoredFiles(monitoredFiles.filter(f => f.id !== id));
     // In a real app, this would trigger a backend API call and generate an alert.
    console.log(`ALERT on ${selectedAgent?.name}: File '${path}' removed from monitoring.`);
  };

  return (
    <>
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-white">File Integrity Monitoring</h2>
            <p className="text-slate-400">Manage and monitor critical files for unauthorized changes.</p>
          </div>
          <AgentSelector />
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Monitored Files List */}
            <div className="lg:col-span-2">
                <form onSubmit={handleAddFile} className="flex gap-2 mb-6">
                    <input
                        type="text"
                        value={newFilePath}
                        onChange={(e) => setNewFilePath(e.target.value)}
                        placeholder="/path/to/critical/file"
                        className="flex-grow px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
                        <Plus size={18}/> Add File
                    </button>
                </form>

                <div className="bg-slate-900 rounded-xl border border-slate-800">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-800 text-sm text-slate-400">
                                <th className="p-4">File Path</th>
                                <th className="p-4">Date Added</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {monitoredFiles.map(file => (
                                <tr key={file.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                                    <td className="p-4 font-mono text-cyan-400">{file.path}</td>
                                    <td className="p-4 text-slate-500">{new Date(file.added).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <button onClick={() => handleRemoveFile(file.id, file.path)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><Trash2 size={16}/></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Recent File Logs */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-xl font-bold text-white mb-4">Recent File Logs</h3>
                 <div className="font-mono text-xs text-slate-400 space-y-3">
                    {fileLogs.map(log => (
                        <div key={log.id} className="flex flex-col">
                            <span className="text-slate-500">{new Date(log.timestamp).toLocaleString()}</span>
                            <p className={log.message.startsWith('ALERT') ? 'text-red-400' : 'text-green-400'}>
                                {log.message}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
      </>
  );
}