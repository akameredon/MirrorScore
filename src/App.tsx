/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Sparkles, BarChart2, User, RefreshCw, LogOut, CheckCircle2, ShieldCheck, Heart, Trash2, CheckSquare, Menu, X } from 'lucide-react';
import { ScanResult, PublicProfileConfig, GrowthMission, UserState } from './types';
import Onboarding from './components/Onboarding';
import Ingestion from './components/Ingestion';
import Dashboard from './components/Dashboard';
import Longitudinal from './components/Longitudinal';
import PublicProfileView from './components/PublicProfileView';

export default function App() {
  const [username, setUsername] = useState<string>('');
  const [consentAccepted, setConsentAccepted] = useState<boolean>(false);
  const [scans, setScans] = useState<ScanResult[]>([]);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'history' | 'profile' | 'ingest'>('ingest');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  
  const [profileConfig, setProfileConfig] = useState<PublicProfileConfig>({
    slug: '',
    visibility: 'link_only',
    display_config: {
      show_overall_tier: true,
      show_domain_tiers: {
        emotional_intelligence: true,
        conflict_resolution: true,
        consistency_integrity: true,
        empathy_others_orientation: true,
        growth_adaptability: true,
        communication_quality: true
      },
      show_growth_trajectory: true,
      show_active_mission_count: true,
      commitment_statement: 'I am auditing my communication style to become more intentional, self-aware, and constructive in relationships.'
    }
  });

  // LocalStorage state hydrator
  useEffect(() => {
    const savedUser = localStorage.getItem('mirrorscore_username');
    const savedConsent = localStorage.getItem('mirrorscore_consent');
    const savedScans = localStorage.getItem('mirrorscore_scans');
    const savedProfile = localStorage.getItem('mirrorscore_profile');

    if (savedUser) setUsername(savedUser);
    if (savedConsent === 'true') setConsentAccepted(true);
    if (savedScans) {
      const parsedScans = JSON.parse(savedScans);
      setScans(parsedScans);
      if (parsedScans.length > 0) {
        setActiveTab('dashboard');
      }
    }
    if (savedProfile) {
      setProfileConfig(JSON.parse(savedProfile));
    }
  }, []);

  const saveToLocalStorage = (name: string, cons: boolean, sList: ScanResult[], pConfig: PublicProfileConfig) => {
    localStorage.setItem('mirrorscore_username', name);
    localStorage.setItem('mirrorscore_consent', cons ? 'true' : 'false');
    localStorage.setItem('mirrorscore_scans', JSON.stringify(sList));
    localStorage.setItem('mirrorscore_profile', JSON.stringify(pConfig));
  };

  const handleOnboardingComplete = (chosenName: string) => {
    setUsername(chosenName);
    setConsentAccepted(true);
    saveToLocalStorage(chosenName, true, scans, profileConfig);
  };

  const handleScanComplete = (newScan: ScanResult) => {
    let updatedScans = [...scans];
    
    // Compute deltas if we already have scans in history
    if (scans.length > 0) {
      const prev = scans[scans.length - 1];
      newScan.previous_scan_id = prev.id;
      newScan.scan_number = prev.scan_number + 1;
      newScan.score_deltas = {
        overall: newScan.synthesis.overall_mirrorscore - prev.synthesis.overall_mirrorscore,
        emotional_intelligence: (newScan.chain_results.emotional_intelligence.domain_score || 0) - (prev.chain_results.emotional_intelligence.domain_score || 0),
        conflict_resolution: (newScan.chain_results.conflict_resolution.domain_score || 0) - (prev.chain_results.conflict_resolution.domain_score || 0),
        consistency_integrity: (newScan.chain_results.consistency_integrity.domain_score || 0) - (prev.chain_results.consistency_integrity.domain_score || 0),
        empathy_others_orientation: (newScan.chain_results.empathy_others_orientation.domain_score || 0) - (prev.chain_results.empathy_others_orientation.domain_score || 0),
        growth_adaptability: (newScan.chain_results.growth_adaptability.domain_score || 0) - (prev.chain_results.growth_adaptability.domain_score || 0),
        communication_quality: (newScan.chain_results.communication_quality.domain_score || 0) - (prev.chain_results.communication_quality.domain_score || 0),
      };
    }

    updatedScans.push(newScan);
    setScans(updatedScans);
    setActiveTab('dashboard');
    saveToLocalStorage(username, true, updatedScans, profileConfig);
  };

  const handleUpdateMissions = (updatedMissions: GrowthMission[]) => {
    if (scans.length === 0) return;
    const latestIndex = scans.length - 1;
    const updatedScan = {
      ...scans[latestIndex],
      growth_missions: updatedMissions
    };
    const updatedScans = [...scans];
    updatedScans[latestIndex] = updatedScan;
    setScans(updatedScans);
    saveToLocalStorage(username, true, updatedScans, profileConfig);
  };

  const handleUpdateProfileConfig = (newConfig: PublicProfileConfig) => {
    setProfileConfig(newConfig);
    saveToLocalStorage(username, true, scans, newConfig);
  };

  // Trajectory Simulation Builder
  const handleAddSimulatedScan = () => {
    if (scans.length === 0) return;
    const prev = scans[scans.length - 1];
    
    // Construct a positive progressive scan based on their growth missions
    const clonedChainResults = JSON.parse(JSON.stringify(prev.chain_results));
    
    // Boost scores representing active practice deltas
    clonedChainResults.conflict_resolution.domain_score = Math.min(10.0, (clonedChainResults.conflict_resolution.domain_score || 6.2) + 1.2);
    clonedChainResults.emotional_intelligence.domain_score = Math.min(10.0, (clonedChainResults.emotional_intelligence.domain_score || 7.0) + 0.6);
    clonedChainResults.communication_quality.domain_score = Math.min(10.0, (clonedChainResults.communication_quality.domain_score || 6.8) + 0.4);

    // Boost individual dimensions
    clonedChainResults.conflict_resolution.dimensions.constructive_disagreement_capacity.score = Math.min(10.0, clonedChainResults.conflict_resolution.dimensions.constructive_disagreement_capacity.score + 1.4);
    clonedChainResults.emotional_intelligence.dimensions.emotional_regulation_in_text.score = Math.min(10.0, clonedChainResults.emotional_intelligence.dimensions.emotional_regulation_in_text.score + 0.8);

    const overallScore = Math.min(10.0, prev.synthesis.overall_mirrorscore + 0.7);
    const tier = overallScore >= 8.5 ? 'flourishing' : 'growing';

    const simulatedScan: ScanResult = {
      id: `sim_scan_${Date.now()}`,
      scan_number: prev.scan_number + 1,
      created_at: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), // 30 days later
      platforms_analyzed: prev.platforms_analyzed,
      content_items_analyzed: prev.content_items_analyzed + 42,
      data_date_range_start: prev.data_date_range_start,
      data_date_range_end: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
      is_delta_scan: true,
      chain_results: clonedChainResults,
      synthesis: {
        overall_mirrorscore: overallScore,
        overall_tier: tier as any,
        strength_highlights: [
          'De-escalation mastery: High-frequency utilization of de-escalating qualifiers in debate threads.',
          ...prev.synthesis.strength_highlights.slice(0, 2)
        ],
        growth_opportunities: prev.synthesis.growth_opportunities,
        narrative_summary: `This progress audit reveals substantial growth. You successfully implemented active "Acknowledgment and Repair" behavioral methods in conflicts, leading to an impressive boost in your overall communication ratings.`
      },
      growth_missions: prev.growth_missions.map(m => ({ ...m, status: 'completed' })),
      previous_scan_id: prev.id,
      score_deltas: {
        overall: 0.7,
        emotional_intelligence: 0.6,
        conflict_resolution: 1.2,
        consistency_integrity: 0,
        empathy_others_orientation: 0,
        growth_adaptability: 0.2,
        communication_quality: 0.4,
      }
    };

    const updatedScans = [...scans, simulatedScan];
    setScans(updatedScans);
    saveToLocalStorage(username, true, updatedScans, profileConfig);
  };

  const handlePurgeAllData = () => {
    if (confirm('⚠️ WARNING: This will permanently delete your username, consent record, scan history, and public configuration from your browser. This action is irreversible. Proceed with full purge?')) {
      localStorage.clear();
      setUsername('');
      setConsentAccepted(false);
      setScans([]);
      setActiveTab('ingest');
    }
  };

  // Render onboarding first if not accepted
  if (!consentAccepted) {
    return (
      <div id="app-root" className="min-h-screen bg-zinc-950 text-white font-sans">
        <Onboarding onComplete={handleOnboardingComplete} />
      </div>
    );
  }

  const latestScan = scans[scans.length - 1];

  return (
    <div id="app-root" className="min-h-screen bg-zinc-950 text-white font-sans flex flex-col justify-between">
      
      {/* App Header */}
      <header id="app-header" className="border-b border-zinc-900 bg-zinc-950/90 backdrop-blur sticky top-0 z-50 px-4 py-3 md:py-4">
        <div id="header-container" className="max-w-4xl mx-auto flex items-center justify-between">
          <div id="header-logo" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Sparkles className="w-4.5 h-4.5 text-teal-400" />
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block text-white font-sans">MirrorScore</span>
              <span className="text-[9px] text-zinc-500 block font-mono">User: @{username.toLowerCase()}</span>
            </div>
          </div>

          {/* Desktop Navigation (Horizontal Bar on larger screens) */}
          {scans.length > 0 && (
            <nav id="desktop-nav" className="hidden md:flex items-center gap-1.5 bg-zinc-900/50 p-1 rounded-xl border border-zinc-800/60">
              <button
                id="desk-nav-dashboard"
                onClick={() => { setActiveTab('dashboard'); setIsMenuOpen(false); }}
                className={`px-3.5 py-2 min-h-[38px] text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'dashboard' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-zinc-400 hover:text-white border border-transparent'
                }`}
              >
                Coaching
              </button>
              <button
                id="desk-nav-history"
                onClick={() => { setActiveTab('history'); setIsMenuOpen(false); }}
                className={`px-3.5 py-2 min-h-[38px] text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'history' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-zinc-400 hover:text-white border border-transparent'
                }`}
              >
                Trajectory
              </button>
              <button
                id="desk-nav-profile"
                onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }}
                className={`px-3.5 py-2 min-h-[38px] text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'profile' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-zinc-400 hover:text-white border border-transparent'
                }`}
              >
                Bio Link
              </button>
              <button
                id="desk-nav-ingest"
                onClick={() => { setActiveTab('ingest'); setIsMenuOpen(false); }}
                className={`px-3.5 py-2 min-h-[38px] text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  activeTab === 'ingest' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'text-zinc-400 hover:text-white border border-transparent'
                }`}
              >
                Scan
              </button>
            </nav>
          )}

          <div id="header-actions" className="flex items-center gap-2">
            {scans.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-zinc-900 border border-zinc-800/80 px-2.5 py-1.5 rounded-lg text-[10px] font-mono text-zinc-300">
                <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                <span>Verified Audit Active</span>
              </div>
            )}
            
            {/* Mobile Hamburger Menu Toggle Button (Visible only on mobile/tablet) */}
            {scans.length > 0 && (
              <button
                id="mobile-menu-toggle"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Toggle navigation menu"
                className="md:hidden p-2 min-h-[44px] min-w-[44px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-300 hover:text-white transition-all cursor-pointer flex items-center justify-center"
              >
                {isMenuOpen ? <X className="w-5 h-5 text-teal-400" /> : <Menu className="w-5 h-5" />}
              </button>
            )}

            <button
              id="purge-all-data-btn"
              onClick={handlePurgeAllData}
              title="Purge Data Record"
              className="p-2 min-h-[44px] min-w-[44px] bg-zinc-900 hover:bg-rose-950/20 hover:text-rose-400 border border-zinc-800 rounded-xl text-zinc-500 transition-all cursor-pointer flex items-center justify-center"
            >
              <Trash2 className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Mobile Collapsible Drawer (Dropdown overlay) */}
        {scans.length > 0 && isMenuOpen && (
          <div
            id="mobile-menu-drawer"
            className="md:hidden border-t border-zinc-900 bg-zinc-950 px-4 py-6 space-y-4 absolute left-0 right-0 top-[100%] shadow-2xl z-50 animate-in fade-in slide-in-from-top-4 duration-200"
          >
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block px-2">Navigation Menu</span>
            <div className="grid grid-cols-1 gap-2">
              <button
                id="mob-nav-dashboard"
                onClick={() => { setActiveTab('dashboard'); setIsMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'dashboard' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900/80 border border-transparent'
                }`}
              >
                <CheckSquare className="w-4.5 h-4.5 shrink-0" />
                <span className="flex-grow text-left">Coaching Dashboard</span>
                <span className="text-[10px] font-mono text-zinc-500">View Missions</span>
              </button>

              <button
                id="mob-nav-history"
                onClick={() => { setActiveTab('history'); setIsMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'history' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900/80 border border-transparent'
                }`}
              >
                <BarChart2 className="w-4.5 h-4.5 shrink-0" />
                <span className="flex-grow text-left">Progression Trajectory</span>
                <span className="text-[10px] font-mono text-zinc-500 font-bold text-teal-400">Track</span>
              </button>

              <button
                id="mob-nav-profile"
                onClick={() => { setActiveTab('profile'); setIsMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'profile' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900/80 border border-transparent'
                }`}
              >
                <User className="w-4.5 h-4.5 shrink-0" />
                <span className="flex-grow text-left">Public Bio Link</span>
                <span className="text-[10px] font-mono text-zinc-500">Settings</span>
              </button>

              <button
                id="mob-nav-ingest"
                onClick={() => { setActiveTab('ingest'); setIsMenuOpen(false); }}
                className={`flex items-center gap-3 w-full px-4 py-3.5 min-h-[48px] rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  activeTab === 'ingest' ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20' : 'bg-zinc-900/40 text-zinc-300 hover:bg-zinc-900/80 border border-transparent'
                }`}
              >
                <RefreshCw className="w-4.5 h-4.5 shrink-0 animate-spin" style={{ animationDuration: '6s' }} />
                <span className="flex-grow text-left">Perform New Scan</span>
                <span className="text-[10px] font-mono text-teal-400 font-bold">New</span>
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-900 flex flex-col gap-2">
              <div className="flex items-center justify-between p-3.5 bg-zinc-900/20 border border-zinc-900 rounded-xl text-[11px] text-zinc-400">
                <span>Verification State</span>
                <span className="text-emerald-400 font-bold font-mono">100% Client-Only</span>
              </div>
              <button
                id="mob-nav-purge"
                onClick={() => { setIsMenuOpen(false); handlePurgeAllData(); }}
                className="w-full py-3.5 min-h-[46px] bg-rose-500/5 hover:bg-rose-500/10 text-rose-400 hover:text-rose-300 text-xs font-mono rounded-xl border border-rose-500/10 transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Account & Audit History</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main viewport frame */}
      <main id="app-main-viewport" className="flex-grow px-4 py-6 max-w-4xl w-full mx-auto">
        
        {/* If scans exist but active tab is ingest, show Ingestion. Else render views based on tab choice */}
        {activeTab === 'ingest' ? (
          <Ingestion username={username} onScanComplete={handleScanComplete} />
        ) : scans.length === 0 ? (
          <Ingestion username={username} onScanComplete={handleScanComplete} />
        ) : (
          <>
            {activeTab === 'dashboard' && latestScan && (
              <Dashboard
                scan={latestScan}
                scans={scans}
                username={username}
                profileConfig={profileConfig}
                onUpdateMissions={handleUpdateMissions}
                onRescanRequested={() => setActiveTab('ingest')}
              />
            )}
            {activeTab === 'history' && (
              <Longitudinal
                scans={scans}
                onAddSimulatedScan={handleAddSimulatedScan}
              />
            )}
            {activeTab === 'profile' && latestScan && (
              <PublicProfileView
                scan={latestScan}
                config={profileConfig}
                username={username}
                onUpdateConfig={handleUpdateProfileConfig}
              />
            )}
          </>
        )}
      </main>

      {/* Persistent Sticky Bottom Tab Bar (highly mobile first, hidden on desktop to avoid layout duplication) */}
      {scans.length > 0 && (
        <footer id="app-navigation-footer" className="md:hidden border-t border-zinc-900 bg-zinc-950/90 backdrop-blur-md sticky bottom-0 z-50 py-3 px-4 shadow-2xl">
          <div id="footer-tabs-container" className="max-w-md mx-auto grid grid-cols-4 gap-1">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center py-2.5 min-h-[48px] rounded-xl transition-all cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-zinc-900 text-teal-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <CheckSquare className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-mono uppercase tracking-wider block">Coaching</span>
            </button>
            <button
              id="nav-tab-history"
              onClick={() => setActiveTab('history')}
              className={`flex flex-col items-center justify-center py-2.5 min-h-[48px] rounded-xl transition-all cursor-pointer ${
                activeTab === 'history' ? 'bg-zinc-900 text-teal-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <BarChart2 className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-mono uppercase tracking-wider block">Trajectory</span>
            </button>
            <button
              id="nav-tab-profile"
              onClick={() => setActiveTab('profile')}
              className={`flex flex-col items-center justify-center py-2.5 min-h-[48px] rounded-xl transition-all cursor-pointer ${
                activeTab === 'profile' ? 'bg-zinc-900 text-teal-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <User className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-mono uppercase tracking-wider block">Bio Link</span>
            </button>
            <button
              id="nav-tab-ingest"
              onClick={() => setActiveTab('ingest')}
              className={`flex flex-col items-center justify-center py-2.5 min-h-[48px] rounded-xl transition-all cursor-pointer ${
                activeTab === 'ingest' ? 'bg-zinc-900 text-teal-400' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <RefreshCw className="w-5 h-5 mb-1" />
              <span className="text-[9px] font-mono uppercase tracking-wider block">Scan</span>
            </button>
          </div>
        </footer>
      )}

    </div>
  );
}
