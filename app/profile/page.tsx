"use client";
import { useState } from 'react';
import { UserCircle, Mail, Shield, Bell, Save } from 'lucide-react';

export default function ProfilePage() {
  const [username, setUsername] = useState('sentinel_admin');
  const [email, setEmail] = useState('admin@sentinel.local');
  const [notifications, setNotifications] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd call an API to update user settings
    console.log('Profile updated:', { username, email, notifications });
    alert('Profile updated successfully!');
  };

  return (
    <>
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white">User Profile</h2>
        <p className="text-slate-400">Manage your account settings and preferences.</p>
      </header>

      <div className="bg-slate-900 max-w-2xl rounded-xl border border-slate-800">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-400 mb-2">Username</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Notifications */}
            <div className="flex items-center justify-between pt-4">
               <div className="flex items-center gap-3">
                    <Bell className="w-5 h-5 text-slate-500"/>
                    <div>
                        <h4 className="font-medium text-white">Email Notifications</h4>
                        <p className="text-sm text-slate-400">Receive alerts and summaries via email.</p>
                    </div>
               </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                    type="checkbox" 
                    checked={notifications} 
                    onChange={() => setNotifications(!notifications)} 
                    className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
             {/* Change Password section */}
            <div className="pt-4">
                 <h4 className="font-medium text-white mb-2">Change Password</h4>
                 <div className="space-y-4">
                    <input type="password" placeholder="Current Password"  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    <input type="password" placeholder="New Password"  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                 </div>
            </div>

          </div>
          <footer className="p-6 border-t border-slate-800 flex justify-end">
            <button type="submit" className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
              <Save size={18} /> Save Changes
            </button>
          </footer>
        </form>
      </div>
    </>
  );
}
