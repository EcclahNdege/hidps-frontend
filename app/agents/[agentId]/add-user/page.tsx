"use client";

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { UserPlus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAgent } from '@/lib/agent-context';

export default function AddUserToAgentPage() {
  const router = useRouter();
  const params = useParams();
  const agentId = params.agentId as string;
  const { agents } = useAgent();
  const agent = agents.find(a => a.id === agentId);
  const [email, setEmail] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setFeedback('Please enter an email address.');
      return;
    }
    // In a real app, you would call an API to find the user by email and then insert into agent_users
    console.log(`Adding user with email ${email} to agent ${agent?.name}`);
    setFeedback(`An invitation has been sent to ${email} to join ${agent?.name}.`);
    setEmail('');
  };

  if (!agent) {
    return (
      <div className="text-center text-white">
        <h2 className="text-2xl font-bold">Agent not found</h2>
        <Link href="/agents" className="mt-4 inline-block text-blue-400 hover:text-blue-300">
          Go back to agents list
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <Link href="/agents" className="flex items-center gap-2 text-slate-400 hover:text-slate-200 mb-4">
          <ArrowLeft size={18} />
          Back to Agents
        </Link>
        <h2 className="text-3xl font-bold text-white">Add User to {agent.name}</h2>
        <p className="text-slate-400">Invite a new user to access and manage this agent.</p>
      </header>

      <div className="max-w-md mx-auto bg-slate-900 p-8 rounded-xl border border-slate-800">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
              User Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="user@example.com"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
            >
              <UserPlus size={20} />
              Add User
            </button>
          </div>
        </form>
        {feedback && (
          <p className="mt-4 text-center text-sm text-green-400">{feedback}</p>
        )}
      </div>
    </div>
  );
}
