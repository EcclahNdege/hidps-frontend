"use client";
import { useState } from 'react';
import { Bell, FileWarning, Shield, Users, Trash2, X, CheckCircle, Sidebar, BarChart, BookText, UserCircle, LogOut, Settings } from 'lucide-react';
import Link from 'next/link';

// --- MOCK DATA ---
const initialAlerts = [
  { id: 1, type: 'Login', severity: 'Critical', title: 'SSH Brute Force Detected', details: 'Multiple failed login attempts from IP 192.168.1.105 for user `root`.', timestamp: '2026-02-01T10:00:00Z', resolved: false },
  { id: 2, type: 'File Monitoring', severity: 'High', title: 'Critical File Modified', details: '`/etc/passwd` was modified. Check for unauthorized changes.', timestamp: '2026-02-01T09:55:00Z', resolved: false },
  { id: 3, type: 'Process', severity: 'Medium', title: 'Suspicious Process Started', details: 'A new process `nmap` was started by user `www-data`.', timestamp: '2026-02-01T09:50:00Z', resolved: true },
  { id: 4, type: 'Firewall', severity: 'Medium', title: 'Unusual Port Scan', details: 'Firewall blocked incoming connection attempts on multiple ports from 10.0.2.15.', timestamp: '2026-02-01T09:45:00Z', resolved: false },
  { id: 5, type: 'Login', severity: 'Low', title: 'Successful Admin Login', details: 'User `admin` logged in successfully from a known IP.', timestamp: '2026-02-01T09:40:00Z', resolved: true },
];

const alertTypes = [
    { name: 'All', icon: Bell },
    { name: 'Firewall', icon: Shield },
    { name: 'Login', icon: Users },
    { name: 'File Monitoring', icon: FileWarning },
    { name: 'Process', icon: Bell },
];

const getSeverityStyling = (severity) => {
    switch (severity) {
        case 'Critical': return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 'High': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 'Medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
};

// --- MAIN ALERTS PAGE COMPONENT ---
export default function AlertsPage() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [activeFilter, setActiveFilter] = useState('All');

  const handleResolve = (id) => {
    setAlerts(alerts.map(a => a.id === id ? { ...a, resolved: true } : a));
    if (selectedAlert?.id === id) setSelectedAlert(null);
  };

  const handleDelete = (id) => {
    setAlerts(alerts.filter(a => a.id !== id));
    if (selectedAlert?.id === id) setSelectedAlert(null);
  };

  const filteredAlerts = activeFilter === 'All' ? alerts : alerts.filter(a => a.type === activeFilter);

  return (
    <>
      {/* Main Content */}
      
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-white">Security Alerts</h2>
          <p className="text-slate-400">Monitor, manage, and respond to threats in real-time.</p>
        </header>

        {/* Filter Tabs */}
        <div className="flex items-center border-b border-slate-800 mb-6">
            {alertTypes.map(type => (
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

        {/* Alerts List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredAlerts.map(alert => (
                <div 
                    key={alert.id}
                    onClick={() => setSelectedAlert(alert)}
                    className={`bg-slate-900 rounded-xl border-l-4 p-5 cursor-pointer transition-all hover:bg-slate-800/50 ${getSeverityStyling(alert.severity)} ${alert.resolved ? 'opacity-50' : ''}`}
                >
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-white pr-4">{alert.title}</h3>
                        <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(alert.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2 truncate">{alert.details}</p>
                </div>
            ))}
            {filteredAlerts.length === 0 && <p className="text-slate-500">No alerts for this category.</p>}
        </div>

        {/* Alert Detail Modal */}
        {selectedAlert && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
                   <header className="flex justify-between items-center p-6 border-b border-slate-800">
                        <div className="flex items-center gap-3">
                            <span className={`p-2 h-fit rounded-full ${getSeverityStyling(selectedAlert.severity)}`}><Bell size={20}/></span>
                            <div>
                                <h2 className="text-xl font-bold text-white">{selectedAlert.title}</h2>
                                <p className="text-sm text-slate-500">{new Date(selectedAlert.timestamp).toUTCString()}</p>
                            </div>
                        </div>
                        <button onClick={() => setSelectedAlert(null)} className="p-2 rounded-full hover:bg-slate-800"><X size={20}/></button>
                   </header>
                   <div className="p-6">
                        <p className="text-slate-300">{selectedAlert.details}</p>
                   </div>
                   <footer className="p-6 border-t border-slate-800 flex justify-end gap-4">
                        <button onClick={() => handleDelete(selectedAlert.id)} className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"><Trash2 size={16}/> Delete</button>
                        {!selectedAlert.resolved && 
                            <button onClick={() => handleResolve(selectedAlert.id)} className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20"><CheckCircle size={16}/> Resolve Alert</button>
                        }
                   </footer>
                </div>
            </div>
        )}
      
    </>
  );
}
