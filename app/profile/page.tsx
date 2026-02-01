"use client";
import { useState, useEffect } from 'react';
import { createClient } from '../../lib/supabase/client';
import { UserCircle, Mail, Bell, Save } from 'lucide-react';
import { User } from '@supabase/supabase-js';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [notifications, setNotifications] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        setEmail(user.email || '');
        setDisplayName(user.user_metadata?.full_name || '');
        setNotifications(user.user_metadata?.notifications ?? true);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!user) {
      setError("You must be logged in to update your profile.");
      setLoading(false);
      return;
    }

    try {
      // Update email and username
      const { error: updateError } = await supabase.auth.updateUser({
        email: email,
        data: { full_name: displayName, notifications: notifications }
      });

      if (updateError) throw updateError;

      // Update password if a new one is provided
      if (newPassword) {
        const { error: passwordError } = await supabase.auth.updateUser({ password: newPassword });
        if (passwordError) throw passwordError;
      }

      setSuccess('Profile updated successfully!');
      setNewPassword('');

    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !user) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white">User Profile</h2>
        <p className="text-slate-400">Manage your account settings and preferences.</p>
      </header>

      <div className="bg-slate-900 max-w-2xl rounded-xl border border-slate-800">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">
            {error && <p className="text-red-500 text-center">{error}</p>}
            {success && <p className="text-green-500 text-center">{success}</p>}
            
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-slate-400 mb-2">Display Name</label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="text"
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
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
                    <input 
                      type="password" 
                      placeholder="New Password"  
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                 </div>
            </div>

          </div>
          <footer className="p-6 border-t border-slate-800 flex justify-end">
            <button type="submit" disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg">
              <Save size={18} /> {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </footer>
        </form>
      </div>
    </>
  );
}
