"use client";
import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import AgentSelector from '@/components/AgentSelector';
import { useAgent } from '@/lib/agent-context';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

type MonitoredFile = Database['public']['Tables']['monitored_files']['Row'];

// --- MAIN FILE MONITORING PAGE COMPONENT ---
export default function FileMonitoringPage() {
  const { selectedAgent } = useAgent();
  const [monitoredFiles, setMonitoredFiles] = useState<MonitoredFile[]>([]);
  const [newFilePath, setNewFilePath] = useState('');
  const supabase = createClient();

  useEffect(() => {
    if (!selectedAgent) return;

    const fetchMonitoredFiles = async () => {
      const { data, error } = await supabase
        .from('monitored_files')
        .select('*')
        .eq('agent_id', selectedAgent.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching monitored files:', error);
      } else {
        setMonitoredFiles(data);
      }
    };

    fetchMonitoredFiles();
  }, [selectedAgent, supabase]);

  const handleAddFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newFilePath.trim() === '' || !selectedAgent) return;
    
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const newFile = {
      agent_id: selectedAgent.id,
      file_path: newFilePath.trim(),
      added_by: session.user.id,
    };

    const { data, error } = await supabase.from('monitored_files').insert(newFile).select();

    if (error) {
        console.error('Error adding file:', error);
    } else if (data) {
        setMonitoredFiles([data[0], ...monitoredFiles]);
        setNewFilePath('');
    }
  };

  const handleRemoveFile = async (id: string) => {
    const { error } = await supabase.from('monitored_files').delete().eq('id', id);
    if (error) {
        console.error('Error deleting file:', error);
    }
    else {
        setMonitoredFiles(monitoredFiles.filter(f => f.id !== id));
    }
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
                                    <td className="p-4 font-mono text-cyan-400">{file.file_path}</td>
                                    <td className="p-4 text-slate-500">{new Date(file.created_at).toLocaleDateString()}</td>
                                    <td className="p-4">
                                        <button onClick={() => handleRemoveFile(file.id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-full"><Trash2 size={16}/></button>
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
                    <p>Coming soon...</p>
                </div>
            </div>
        </div>
      </>
  );
}