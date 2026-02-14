"use client";

import Link from 'next/link';
import { 
  LayoutDashboard, 
  BarChart, 
  FileCog, 
  AlertTriangle, 
  History, 
  Settings, 
  LogOut, 
  ChevronsLeft, 
  ChevronsRight 
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/dashboard/analytics', icon: BarChart, label: 'Analytics' },
  { href: '/dashboard/rules', icon: FileCog, label: 'Rules' },
  { href: '/dashboard/alerts', icon: AlertTriangle, label: 'Alerts' },
  { href: '/dashboard/logs', icon: History, label: 'Logs' },
];

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  return (
    <aside 
      className={`bg-slate-900 flex flex-col transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}
    >
      <div className={`flex items-center p-6 border-b border-slate-800 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
        {!isCollapsed && <h1 className="text-xl font-bold text-white whitespace-nowrap">HIDPS</h1>}
        <button onClick={onToggle} className="p-2 text-slate-400 hover:bg-slate-800 rounded-lg">
          {isCollapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
        </button>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <Link 
            key={item.href} 
            href={item.href} 
            className={`flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}
            title={isCollapsed ? item.label : ''}
          >
            <item.icon size={20} />
            {!isCollapsed && <span className="whitespace-nowrap">{item.label}</span>}
          </Link>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <Link 
          href="/dashboard/settings" 
          className={`flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Settings' : ''}
        >
          <Settings size={20} />
          {!isCollapsed && <span className="whitespace-nowrap">Settings</span>}
        </Link>
        <button 
          className={`w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Logout' : ''}
        >
          <LogOut size={20} />
          {!isCollapsed && <span className="whitespace-nowrap">Logout</span>}
        </button>
      </div>
    </aside>
  );
}