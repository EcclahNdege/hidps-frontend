"use client";
import { useState, useEffect } from 'react';
import { Bell, Shield, Cpu, MemoryStick, HardDrive } from 'lucide-react';
import AgentSelector from '@/components/AgentSelector';
import { useAgent } from '@/lib/agent-context';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';

type Alert = Database['public']['Tables']['alerts']['Row'];

// --- HELPER COMPONENTS ---
const ResourceUsage = ({ icon: Icon, title, value, color }: { icon: React.ElementType, title: string, value: number, color: string }) => (
    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-slate-400">
                <Icon size={18} />
                <span className="font-medium">{title}</span>
            </div>
            <span className="font-bold text-white">{value.toFixed(1)}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2.5">
            <div className={`${color} h-2.5 rounded-full`} style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

const StatusIndicator = ({ label, isOnline }: { label: string, isOnline: boolean }) => (
    <div className="flex items-center gap-2 text-sm">
        <span className="relative flex h-3 w-3">
            {isOnline && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
            <span className={`relative inline-flex rounded-full h-3 w-3 ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
        </span>
        <span className="text-slate-400">{label}:</span>
        <span className={isOnline ? "text-green-400" : "text-red-400"}>{isOnline ? 'Online' : 'Offline'}</span>
    </div>
);


// --- MAIN DASHBOARD COMPONENT ---
export default function DashboardPage() {
  const [cpu, setCpu] = useState(35);
  const [ram, setRam] = useState(60);
  const [storage, setStorage] = useState(82);
  const { selectedAgent } = useAgent();
  const [recentAlerts, setRecentAlerts] = useState<Alert[]>([]);
  const supabase = createClient();

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(prev => Math.max(10, Math.min(90, prev + (Math.random() - 0.5) * 5)));
      setRam(prev => Math.max(40, Math.min(80, prev + (Math.random() - 0.5) * 2)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!selectedAgent) return;

    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .eq('agent_id', selectedAgent.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error fetching alerts:', error);
      } else {
        setRecentAlerts(data);
      }
    };

    fetchAlerts();
  }, [selectedAgent, supabase]);

  return (
    <>
      {/* Main Content */}
      
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
            <div className="flex items-center gap-4">
              <StatusIndicator label="Agent Status" isOnline={selectedAgent?.is_online || false} />
              <AgentSelector />
            </div>
        </header>

        {/* Resource Usage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <ResourceUsage icon={Cpu} title="CPU Usage" value={cpu} color="bg-cyan-500" />
            <ResourceUsage icon={MemoryStick} title="RAM Usage" value={ram} color="bg-purple-500" />
            <ResourceUsage icon={HardDrive} title="Storage" value={storage} color="bg-amber-500" />
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Shield size={20} className="text-slate-400"/>
                    <span className="font-medium text-slate-400">Firewall</span>
                </div>
                <span className="font-bold text-green-400 bg-green-500/10 px-3 py-1 rounded-full">Enabled</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Alerts */}
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4">Recent Alerts</h3>
              <div className="space-y-3">
                {recentAlerts.map(alert => (
                  <div key={alert.id} className="flex gap-4 p-3 rounded-lg hover:bg-slate-800/50">
                     <div className={`mt-1 p-2 h-fit rounded-full ${
                        alert.severity === 4 ? 'bg-red-500/20 text-red-400' :
                        alert.severity === 3 ? 'bg-orange-500/20 text-orange-400' :
                        alert.severity === 2 ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}><Bell size={16}/></div>
                      <div>
                        <p className="font-semibold text-white">{alert.title}</p>
                        <p className="text-sm text-slate-400">{alert.message}</p>
                        <p className="text-xs text-slate-500">{new Date(alert.created_at).toLocaleTimeString()}</p>
                      </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Logs */}
             <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4">Recent Logs</h3>
              <div className="font-mono text-xs text-slate-400 space-y-2">
                <p>Coming soon...</p>
              </div>
            </div>
        </div>
      
    </>
  );
}
