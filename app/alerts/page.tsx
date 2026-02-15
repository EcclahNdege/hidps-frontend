"use client";
import { useState, useEffect } from 'react';
import { Bell, FileWarning, Shield, Users, Trash2, X, CheckCircle, AlertCircle, Trash, Loader2 } from 'lucide-react';
import AgentSelector from '@/components/AgentSelector';
import { useAgent } from '@/lib/agent-context';
import { createClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/database.types';
import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';

type Alert = Database['public']['Tables']['alerts']['Row'];
type Severity = 'Critical' | 'High' | 'Medium' | 'Low';

// Map frontend display names to backend alert_type values
const alertTypes = [
    { name: 'All', dbTypes: [], icon: Bell },
    { name: 'Firewall', dbTypes: ['firewall', 'network'], icon: Shield },
    { name: 'Login', dbTypes: ['login', 'security'], icon: Users },
    { name: 'File Monitoring', dbTypes: ['file_monitoring', 'integrity'], icon: FileWarning },
    { name: 'Process', dbTypes: ['process', 'privilege_escalation'], icon: Bell },
];

const getSeverityStyling = (severity: number) => {
    switch (severity) {
        case 4: return 'bg-red-500/20 text-red-400 border-red-500/30';
        case 3: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
        case 2: return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
        default: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    }
};

const getSeverityName = (severity: number): Severity => {
    switch (severity) {
        case 4: return 'Critical';
        case 3: return 'High';
        case 2: return 'Medium';
        default: return 'Low';
    }
}

// Format alert messages to be more readable
function formatAlertMessage(message: string): string {
  if (message.includes('.goutputstream')) {
    const fileMatch = message.match(/to\s+(.+\.py|.+\.txt|.+\.json|.+\.conf|.+)/);
    if (fileMatch) {
      const filename = fileMatch[1].split('/').pop();
      return `The monitored file "${filename}" was saved.`;
    }
  }
  
  if (message.startsWith('Moved:')) {
    const toMatch = message.match(/to\s+(.+)/);
    if (toMatch) {
      const filepath = toMatch[1].trim();
      const filename = filepath.split('/').pop() || filepath;
      return `The file "${filename}" was modified and saved.`;
    }
  }
  
  return message;
}

// Toast notification component
function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-in slide-in-from-bottom">
      <CheckCircle size={20} />
      <span>{message}</span>
    </div>
  );
}

// --- MAIN ALERTS PAGE COMPONENT ---
export default function AlertsPage() {
  const { selectedAgent } = useAgent();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const [debugMode, setDebugMode] = useState(false);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [toast, setToast] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!selectedAgent) return;

    const fetchAlerts = async () => {
      let query = supabase.from('alerts').select('*').eq('agent_id', selectedAgent.id);
      
      if (activeFilter !== 'All') {
        const filterConfig = alertTypes.find(t => t.name === activeFilter);
        if (filterConfig && filterConfig.dbTypes.length > 0) {
          query = query.in('alert_type', filterConfig.dbTypes);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error);
      } else {
        setAlerts(data);
      }
    };

    fetchAlerts();

    const channel = supabase
      .channel(`alerts:agent_id=eq.${selectedAgent.id}`)
      .on<Alert>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'alerts',
          filter: `agent_id=eq.${selectedAgent.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Alert> | any) => {
          const shouldShow = activeFilter === 'All' || 
            alertTypes.find(t => t.name === activeFilter)?.dbTypes.includes(payload.new.alert_type);
          
          if (shouldShow) {
            setAlerts((current) => [payload.new, ...current]);
          }
        }
      )
      .on<Alert>(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'alerts',
          filter: `agent_id=eq.${selectedAgent.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Alert> | any) => {
          setAlerts((current) =>
            current.map((alert) => (alert.id === payload.new.id ? payload.new : alert))
          );
          if (selectedAlert?.id === payload.new.id) {
            setSelectedAlert(payload.new);
          }
        }
      )
      .on<Alert>(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'alerts',
          filter: `agent_id=eq.${selectedAgent.id}`,
        },
        (payload: RealtimePostgresChangesPayload<Alert> | any) => {
          setAlerts((current) => current.filter((alert) => alert.id !== payload.old.id));
          setDeletingIds(prev => {
            const next = new Set(prev);
            next.delete(payload.old.id);
            return next;
          });
          if (selectedAlert?.id === payload.old.id) {
            setSelectedAlert(null);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedAgent, activeFilter, supabase]);

  const handleResolve = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;
    
    const { error } = await supabase
      .from('alerts')
      .update({ 
        resolved: true, 
        resolved_by: session.user.id, 
        resolved_at: new Date().toISOString() 
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error resolving alert:', error);
    }
  };

  const handleDelete = async (id: string) => {
    // Mark as deleting immediately
    setDeletingIds(prev => new Set(prev).add(id));
    
    const { error } = await supabase.from('alerts').delete().eq('id', id);
    
    if (error) {
      console.error('Error deleting alert:', error);
      // Remove from deleting set on error
      setDeletingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleDeleteAll = async () => {
    if (!selectedAgent) return;
    
    setIsDeleting(true);
    
    // Get alerts to delete
    const alertsToDelete = activeFilter === 'All' 
      ? alerts
      : alerts.filter(a => {
          const filterConfig = alertTypes.find(t => t.name === activeFilter);
          return filterConfig?.dbTypes.includes(a.alert_type || '');
        });
    
    const idsToDelete = alertsToDelete.map(a => a.id);
    const count = idsToDelete.length;
    
    // IMMEDIATE UI UPDATE - Remove from view right away
    setAlerts(current => current.filter(alert => !idsToDelete.includes(alert.id)));
    setShowDeleteAllConfirm(false);
    setToast(`Deleting ${count} alert${count !== 1 ? 's' : ''}...`);
    
    // Delete from database in background
    const { error } = await supabase
      .from('alerts')
      .delete()
      .in('id', idsToDelete);
    
    if (error) {
      console.error('Error deleting alerts:', error);
      // Refetch on error to restore accurate state
      const { data } = await supabase
        .from('alerts')
        .select('*')
        .eq('agent_id', selectedAgent.id)
        .order('created_at', { ascending: false });
      if (data) setAlerts(data);
      setToast('Failed to delete alerts');
    } else {
      setToast(`Deleted ${count} alert${count !== 1 ? 's' : ''}`);
    }
    
    setIsDeleting(false);
  };

  const uniqueAlertTypes = [...new Set(alerts.map(a => a.alert_type))];
  
  const getCategoryCount = (categoryName: string) => {
    if (categoryName === 'All') return alerts.length;
    const filterConfig = alertTypes.find(t => t.name === categoryName);
    if (!filterConfig) return 0;
    return alerts.filter(a => filterConfig.dbTypes.includes(a.alert_type || '')).length;
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Main Content */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Security Alerts</h2>
          <div className="flex items-center gap-2">
            <p className="text-slate-400">Monitor, manage, and respond to threats in real-time.</p>
            <button 
              onClick={() => setDebugMode(!debugMode)}
              className="flex items-center gap-1 text-xs text-blue-400 bg-blue-900/50 rounded-full px-2 py-0.5 hover:bg-blue-900 cursor-pointer"
            >
              <AlertCircle size={12} />
              Debug
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {alerts.length > 0 && (
            <button
              onClick={() => setShowDeleteAllConfirm(true)}
              disabled={isDeleting}
              className="flex items-center gap-2 px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg border border-red-600/30 transition disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash size={16} />
                  Delete All {activeFilter !== 'All' ? activeFilter : ''} ({alerts.length})
                </>
              )}
            </button>
          )}
          <AgentSelector />
        </div>
      </header>

      {/* Debug Info Panel */}
      {debugMode && (
        <div className="mb-6 p-4 bg-slate-800 rounded-lg border border-slate-700">
          <h3 className="text-sm font-bold text-white mb-2">Debug Information</h3>
          <div className="text-xs text-slate-300 space-y-1 font-mono">
            <p><strong>Total alerts:</strong> {alerts.length}</p>
            <p><strong>Active filter:</strong> {activeFilter}</p>
            <p><strong>Unique alert types in DB:</strong> {uniqueAlertTypes.join(', ') || 'None'}</p>
            <div className="mt-2">
              <strong>Type mappings:</strong>
              {alertTypes.filter(t => t.name !== 'All').map(type => (
                <div key={type.name} className="ml-2 text-cyan-400">
                  • {type.name} → [{type.dbTypes.join(', ')}]
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center border-b border-slate-800 mb-6 overflow-x-auto">
        {alertTypes.map(type => {
          const count = getCategoryCount(type.name);
          return (
            <button 
              key={type.name}
              onClick={() => setActiveFilter(type.name)}
              className={`flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-medium transition-colors whitespace-nowrap
                ${activeFilter === type.name 
                  ? 'border-blue-500 text-blue-400' 
                  : 'border-transparent text-slate-500 hover:text-slate-300'}`
              }
            >
              <type.icon size={16} />
              <span>{type.name}</span>
              <span className="text-xs opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
        {alerts.map(alert => {
          const formattedMessage = formatAlertMessage(alert.message || '');
          const isDeleting = deletingIds.has(alert.id);
          
          return (
            <div 
              key={alert.id}
              onClick={() => !isDeleting && setSelectedAlert(alert)}
              className={`bg-slate-900 rounded-xl border-l-4 p-5 cursor-pointer transition-all hover:bg-slate-800/50 ${getSeverityStyling(alert.severity)} ${alert.resolved ? 'opacity-50' : ''} ${isDeleting ? 'opacity-30 pointer-events-none' : ''}`}
            >
              {isDeleting && (
                <div className="flex items-center justify-center mb-2">
                  <Loader2 size={16} className="animate-spin text-slate-400" />
                </div>
              )}
              <div className="flex justify-between items-start">
                <h3 className="font-bold text-white pr-4">{alert.title}</h3>
                <span className="text-xs text-slate-500 whitespace-nowrap">{new Date(alert.created_at).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm text-slate-400 mt-2 line-clamp-2">{formattedMessage}</p>
              {debugMode && (
                <p className="text-xs text-cyan-400 mt-2 font-mono">Type: {alert.alert_type}</p>
              )}
            </div>
          );
        })}
        {alerts.length === 0 && (
          <div className="col-span-full text-center py-8">
            <p className="text-slate-500 mb-2">No alerts for this category.</p>
            {activeFilter !== 'All' && uniqueAlertTypes.length > 0 && (
              <div className="text-sm text-slate-600">
                <p>Available types: {uniqueAlertTypes.join(', ')}</p>
                <button 
                  onClick={() => setActiveFilter('All')}
                  className="mt-2 text-blue-400 hover:text-blue-300 underline"
                >
                  Show all alerts
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Delete All Confirmation Modal */}
      {showDeleteAllConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-red-500/20 rounded-full">
                <Trash className="text-red-400" size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Delete All Alerts?</h3>
                <p className="text-sm text-slate-400">
                  {activeFilter === 'All' 
                    ? `This will permanently delete all ${alerts.length} alerts.`
                    : `This will permanently delete all ${getCategoryCount(activeFilter)} ${activeFilter} alerts.`
                  }
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAll}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                {isDeleting ? 'Deleting...' : 'Delete All'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-2xl bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl">
            <header className="flex justify-between items-center p-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <span className={`p-2 h-fit rounded-full ${getSeverityStyling(selectedAlert.severity)}`}><Bell size={20}/></span>
                <div>
                  <h2 className="text-xl font-bold text-white">{selectedAlert.title}</h2>
                  <p className="text-sm text-slate-500">{new Date(selectedAlert.created_at).toUTCString()}</p>
                  {debugMode && (
                    <p className="text-xs text-cyan-400 font-mono mt-1">Type: {selectedAlert.alert_type}</p>
                  )}
                </div>
              </div>
              <button onClick={() => setSelectedAlert(null)} className="p-2 rounded-full hover:bg-slate-800"><X size={20}/></button>
            </header>
            <div className="p-6">
              <p className="text-slate-300 whitespace-pre-wrap">{formatAlertMessage(selectedAlert.message || '')}</p>
            </div>
            <footer className="p-6 border-t border-slate-800 flex justify-end gap-4">
              <button 
                onClick={() => {
                  handleDelete(selectedAlert.id);
                  setSelectedAlert(null);
                }} 
                className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20"
              >
                <Trash2 size={16}/> Delete
              </button>
              {!selectedAlert.resolved && 
                <button 
                  onClick={() => handleResolve(selectedAlert.id)} 
                  className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-400 rounded-lg hover:bg-green-500/20"
                >
                  <CheckCircle size={16}/> Resolve Alert
                </button>
              }
            </footer>
          </div>
        </div>
      )}
    </>
  );
}