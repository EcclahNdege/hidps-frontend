"use client";
import { useState, useEffect } from 'react';
import { Bell, FileCheck, Shield, BarChart, Settings, LogOut, FileWarning, UserCircle, Cpu, MemoryStick, HardDrive, BookText } from 'lucide-react';
import Link from 'next/link';

// --- MOCK DATA ---
const initialRecentAlerts = [
  { id: 1, severity: 'Critical', type: 'SSH Brute Force', ip: '192.168.1.105', time: '2m ago', details: '5 failed login attempts for user root.' },
  { id: 2, severity: 'High', type: 'File Tampering', ip: '127.0.0.1', time: '5m ago', details: '/etc/passwd has been modified.' },
  { id: 3, severity: 'Medium', type: 'New Process', ip: '127.0.0.1', time: '10m ago', details: 'A new process `nmap` was started.' },
];

const initialRecentLogs = [
    { id: 1, service: 'sshd', time: '1m ago', message: 'Accepted publickey for user from 192.168.1.109' },
    { id: 2, service: 'kernel', time: '3m ago', message: 'Firewall: *TCP_IN Blocked* IN=eth0 OUT= MAC=...' },
    { id: 3, service: 'sudo', time: '8m ago', message: 'user : TTY=pts/0 ; PWD=/home/user ; USER=root ; COMMAND=/bin/bash' },
];


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

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(prev => Math.max(10, Math.min(90, prev + (Math.random() - 0.5) * 5)));
      setRam(prev => Math.max(40, Math.min(80, prev + (Math.random() - 0.5) * 2)));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-300 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 p-6 flex-col justify-between border-r border-slate-800 hidden md:flex">
        <div>
          <h1 className="text-2xl font-bold text-white mb-10 flex items-center gap-2"><Shield size={28}/> Sentinel</h1>
          <nav className="space-y-3">
            <Link href="/dashboard" className="flex items-center py-2 px-3 bg-blue-500/10 text-blue-300 rounded-lg"><BarChart className="mr-3" /> Dashboard</Link>
            <Link href="/alerts" className="flex items-center py-2 px-3 text-slate-400 hover:bg-slate-800 rounded-lg"><Bell className="mr-3" /> Alerts</Link>
            <Link href="/logs" className="flex items-center py-2 px-3 text-slate-400 hover:bg-slate-800 rounded-lg"><BookText className="mr-3" /> Logs</Link>
            <Link href="#" className="flex items-center py-2 px-3 text-slate-400 hover:bg-slate-800 rounded-lg"><Shield className="mr-3" /> Firewall</Link>
            <Link href="/file-monitoring" className="flex items-center py-2 px-3 text-slate-400 hover:bg-slate-800 rounded-lg"><FileWarning className="mr-3" /> File Monitoring</Link>
          </nav>
        </div>
        <div>
            <Link href="#" className="flex items-center py-2 px-3 text-slate-400 hover:bg-slate-800 rounded-lg"><UserCircle className="mr-3" /> Profile</Link>
            <Link href="/login" className="flex items-center py-2 px-3 text-slate-400 hover:bg-slate-800 rounded-lg"><LogOut className="mr-3" /> Logout</Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-8">
        <header className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
            <StatusIndicator label="Agent Status" isOnline={true} />
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
                {initialRecentAlerts.map(alert => (
                  <div key={alert.id} className="flex gap-4 p-3 rounded-lg hover:bg-slate-800/50">
                     <div className={`mt-1 p-2 h-fit rounded-full ${
                        alert.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        alert.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        'bg-yellow-500/20 text-yellow-400'
                      }`}><Bell size={16}/></div>
                      <div>
                        <p className="font-semibold text-white">{alert.type}</p>
                        <p className="text-sm text-slate-400">{alert.details}</p>
                        <p className="text-xs text-slate-500">{alert.time}</p>
                      </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Logs */}
             <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
              <h3 className="text-xl font-bold text-white mb-4">Recent Logs</h3>
              <div className="font-mono text-xs text-slate-400 space-y-2">
                {initialRecentLogs.map(log => (
                    <div key={log.id} className="flex gap-4">
                        <span className="text-slate-500">{log.time}</span>
                        <span className="font-bold text-cyan-400">{log.service}:</span>
                        <span className="truncate">{log.message}</span>
                    </div>
                ))}
              </div>
            </div>
        </div>
      </main>
    </div>
  );
}
