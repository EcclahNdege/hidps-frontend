"use client";
import { CheckCircle, Download, Terminal, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function AgentSetupPage() {
  const agentDownloadLink = "/downloads/sentinel-agent.tar.gz"; // Placeholder link

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <CheckCircle className="mx-auto text-emerald-500 w-16 h-16 mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold text-white">Account Created!</h1>
          <p className="text-lg text-slate-400 mt-2">Your next step is to install the Sentinel Agent on your host machine.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-8">
          <div>
            <h2 className="text-2xl font-bold flex items-center mb-4">
              <Download className="mr-3 text-blue-500" />
              1. Download the Agent
            </h2>
            <p className="text-slate-400 mb-4">
              Download the agent package for your Linux distribution.
            </p>
            <a 
              href={agentDownloadLink} 
              download
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all transform hover:scale-105"
            >
              <Download size={20} />
              Download Agent (Linux x64)
            </a>
          </div>

          <div>
            <h2 className="text-2xl font-bold flex items-center mb-4">
              <Terminal className="mr-3 text-green-500" />
              2. Install & Run
            </h2>
            <p className="text-slate-400 mb-4">
              Extract the package and run the installation script. You will need root privileges.
            </p>
            <div className="bg-slate-950 p-4 rounded-lg text-sm font-mono border border-slate-700">
              <p className="text-gray-500"># Unpack the agent</p>
              <p className="text-slate-300">$ tar -xvzf sentinel-agent.tar.gz</p>
              <br/>
              <p className="text-gray-500"># Navigate into the directory</p>
              <p className="text-slate-300">$ cd sentinel-agent</p>
              <br/>
              <p className="text-gray-500"># Run the installer with sudo</p>
              <p className="text-slate-300">$ sudo ./install.sh</p>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold flex items-center mb-4">
              <ShieldCheck className="mr-3 text-emerald-500" />
              3. Confirm Installation
            </h2>
            <p className="text-slate-400 mb-4">
              After the script runs, the agent will automatically open a new tab in your browser to confirm a successful connection. 
              Once confirmed, you will be redirected to your dashboard.
            </p>
          </div>
          
          <div className="text-center pt-6">
            <p className="text-slate-500">Finished? <Link href="/dashboard" className="text-blue-500 hover:underline">Go to Dashboard &rarr;</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
