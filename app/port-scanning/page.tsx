"use client";
import { useState, useEffect } from 'react';
import { Shield, Search, Loader2, Zap } from 'lucide-react';
import AgentSelector from '@/components/AgentSelector';
import { useAgent } from '@/lib/agent-context';
import { useWebSocket } from '@/lib/websocket-context';

const getService = (port: number) => {
    switch (port) {
        case 21: return 'FTP';
        case 22: return 'SSH';
        case 23: return 'Telnet';
        case 25: return 'SMTP';
        case 53: return 'DNS';
        case 80: return 'HTTP';
        case 110: return 'POP3';
        case 143: return 'IMAP';
        case 443: return 'HTTPS';
        case 445: return 'SMB';
        case 993: return 'IMAPS';
        case 995: return 'POP3S';
        case 1723: return 'PPTP';
        case 3306: return 'MySQL';
        case 3389: return 'RDP';
        case 5432: return 'PostgreSQL';
        case 5900: return 'VNC';
        case 8080: return 'HTTP-alt';
        case 8443: return 'HTTPS-alt';
        default: return 'Unknown';
    }
};

type ScanResult = {
    port: number;
    status: 'open';
    service: string;
};

export default function PortScanningPage() {
    const { selectedAgent } = useAgent();
    const { sendCommand, isConnected } = useWebSocket();
    const [target, setTarget] = useState('');
    const [scanResults, setScanResults] = useState<ScanResult[]>([]);
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Listen for scan results from WebSocket
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            try {
                const message = JSON.parse(event.data);
                
                if (message.type === "scan_results") {
                    console.log("✅ Scan results received:", message);
                    setIsScanning(false);
                    
                    // Transform agent results to our UI format
                    const results = message.open_ports.map((result: any) => ({
                        port: result.port,
                        status: 'open' as const,
                        service: result.service || getService(result.port)
                    }));
                    
                    setScanResults(results);
                    
                    if (results.length === 0) {
                        setError('No open ports found.');
                    }
                }
            } catch (err) {
                console.error("Error parsing message:", err);
            }
        };

        // Subscribe to WebSocket messages
        if (typeof window !== 'undefined') {
            window.addEventListener('message', handleMessage);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('message', handleMessage);
            }
        };
    }, []);

    const handleScan = async () => {
        if (!target) {
            setError('Please enter a target host or IP address.');
            return;
        }
        
        if (!selectedAgent) {
            setError('Please select an agent.');
            return;
        }

        if (!isConnected) {
            setError('WebSocket not connected. Please wait and try again.');
            return;
        }

        setError(null);
        setIsScanning(true);
        setScanResults([]);

        console.log(`🔍 Starting scan on ${target} via agent ${selectedAgent.id}`);
        
        // Send scan command to agent via WebSocket
        sendCommand(selectedAgent.id, 'scan_common_ports', { 
            ip: target 
        });

        // Safety timeout - if no response in 30 seconds, stop loading
        setTimeout(() => {
            setIsScanning(false);
            setError('Scan timeout. The agent may be offline or the target is unreachable.');
        }, 30000);
    };

    return (
        <>
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Shield size={32} />
                        Port Scanning
                    </h2>
                    <p className="text-slate-400">
                        Scan for open ports on any host or IP address.
                    </p>
                </div>
                <AgentSelector />
            </header>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                        placeholder="Enter target host or IP (e.g., 127.0.0.1)"
                        className="flex-grow bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isScanning}
                        onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                    />
                    <button
                        onClick={handleScan}
                        disabled={isScanning || !selectedAgent || !isConnected}
                        className="flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isScanning ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                <span>Scanning...</span>
                            </>
                        ) : (
                            <>
                                <Search size={18} />
                                <span>Scan Ports</span>
                            </>
                        )}
                    </button>
                </div>
                
                {/* Status messages */}
                {!selectedAgent && (
                     <p className="text-yellow-400 text-sm mt-3">⚠️ Please select an agent to start a scan.</p>
                )}
                {!isConnected && selectedAgent && (
                     <p className="text-red-400 text-sm mt-3">🔴 WebSocket not connected. Please wait...</p>
                )}
                {error && (
                    <p className="text-red-400 text-sm mt-3">❌ {error}</p>
                )}
                
                {/* Info text */}
                <p className="text-slate-500 text-xs mt-3">
                    📡 Scans common ports: 21 (FTP), 22 (SSH), 23 (Telnet), 25 (SMTP), 53 (DNS), 80 (HTTP), 110 (POP3), 143 (IMAP), 443 (HTTPS), 3306 (MySQL), 3389 (RDP), 5432 (PostgreSQL), 8080 (HTTP-alt), 8443 (HTTPS-alt)
                </p>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-xl">
                <div className="p-4 border-b border-slate-800">
                    <h3 className="text-lg font-semibold text-white">Scan Results</h3>
                    {scanResults.length > 0 && (
                        <p className="text-sm text-slate-400 mt-1">
                            ✅ Found {scanResults.length} open port{scanResults.length !== 1 ? 's' : ''} on {target}
                        </p>
                    )}
                </div>
                <div className="p-4">
                    {isScanning && (
                         <div className="text-center py-8 text-slate-400">
                             <Loader2 size={24} className="animate-spin inline-block mb-2"/>
                             <p>Scanning {target}...</p>
                             <p className="text-xs text-slate-500 mt-2">This may take up to 30 seconds</p>
                         </div>
                    )}
                    {!isScanning && scanResults.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            <Zap size={32} className="mx-auto mb-2" />
                            <p>No scan results yet. Enter a target and click Scan Ports.</p>
                        </div>
                    )}
                    {scanResults.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {scanResults.map(result => (
                                <div key={result.port} className="p-4 rounded-lg border bg-green-500/10 border-green-500/30">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-lg text-white">{result.port}</span>
                                        <span className="text-sm font-semibold px-2 py-1 rounded-full bg-green-500/20 text-green-300">
                                            OPEN
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-sm mt-1">{result.service}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}