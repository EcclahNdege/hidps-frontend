"use client";
import { Bell, FileCheck, Shield, BarChart, Settings, LogOut, FileWarning, UserCheck, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

// Mock data for the dashboard
const recentEvents = [
  { id: 1, severity: 'Critical', type: 'SSH Brute Force', ip: '192.168.1.105', time: '2m ago', details: '5 failed login attempts for user root.' },
  { id: 2, severity: 'High', type: 'File Tampering', ip: '127.0.0.1', time: '5m ago', details: '/etc/passwd has been modified.' },
  { id: 3, severity: 'Medium', type: 'New Process', ip: '127.0.0.1', time: '10m ago', details: 'A new process `nmap` was started.' },
  { id: 4, severity: 'Low', type: 'Successful Login', ip: '192.168.1.108', time: '15m ago', details: 'User `admin` logged in successfully.' },
];

const stats = [
    { title: "Today's Alerts", value: "12", icon: AlertTriangle, color: "text-red-500" },
    { title: "Files Monitored", value: "1,428", icon: FileCheck, color: "text-blue-500" },
    { title: "Secure Logins", value: "98", icon: UserCheck, color: "text-green-500" },
];


export default function DashboardPage() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-300">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 p-6 flex flex-col justify-between border-r border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white mb-10">Sentinel HIDS</h1>
          <nav className="space-y-4">
            <Link href="/dashboard" className="flex items-center p-2 bg-blue-500/10 text-blue-300 rounded-lg">
              <BarChart className="mr-3" /> Dashboard
            </Link>
            <Link href="#" className="flex items-center p-2 text-slate-400 hover:bg-slate-800 rounded-lg">
              <Bell className="mr-3" /> Alerts
            </Link>
            <Link href="#" className="flex items-center p-2 text-slate-400 hover:bg-slate-800 rounded-lg">
              <FileWarning className="mr-3" /> FIM
            </Link>
             <Link href="#" className="flex items-center p-2 text-slate-400 hover:bg-slate-800 rounded-lg">
              <Settings className="mr-3" /> Settings
            </Link>
          </nav>
        </div>
        <div>
          <Link href="/login" className="flex items-center p-2 text-slate-400 hover:bg-slate-800 rounded-lg">
            <LogOut className="mr-3" /> Logout
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <h2 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h2>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map(stat => (
                <div key={stat.title} className="bg-slate-900 p-6 rounded-xl border border-slate-800 flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-slate-800 ${stat.color}`}>
                        <stat.icon size={24} />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{stat.title}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                </div>
            ))}
        </div>

        {/* Recent Events Table */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
          <h3 className="text-xl font-bold text-white mb-4">Recent Events</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 text-sm text-slate-400">
                  <th className="p-4">Severity</th>
                  <th className="p-4">Event Type</th>
                  <th className="p-4">Details</th>
                  <th className="p-4">Source IP</th>
                  <th className="p-4">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((event) => (
                  <tr key={event.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        event.severity === 'Critical' ? 'bg-red-500/20 text-red-400' :
                        event.severity === 'High' ? 'bg-orange-500/20 text-orange-400' :
                        event.severity === 'Medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {event.severity}
                      </span>
                    </td>
                    <td className="p-4 text-white font-medium">{event.type}</td>
                    <td className="p-4">{event.details}</td>
                    <td className="p-4 font-mono">{event.ip}</td>
                    <td className="p-4 text-slate-400">{event.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
