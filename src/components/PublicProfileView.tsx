/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Share2, 
  Clipboard, 
  Check, 
  Eye, 
  ToggleLeft, 
  ToggleRight, 
  Sparkles, 
  AlertTriangle, 
  MessageCircle, 
  Heart, 
  Info 
} from 'lucide-react';
import { ScanResult, PublicProfileConfig, TierType } from '../types';

interface PublicProfileViewProps {
  scan: ScanResult;
  config: PublicProfileConfig;
  username: string;
  onUpdateConfig: (newConfig: PublicProfileConfig) => void;
}

export default function PublicProfileView({ scan, config, username, onUpdateConfig }: PublicProfileViewProps) {
  const [copied, setCopied] = useState<boolean>(false);
  const [statement, setStatement] = useState<string>(config.display_config.commitment_statement || '');
  const [successMsg, setSuccessMsg] = useState<string>('');
  
  // Custom toast state
  const [toast, setToast] = useState<{ visible: boolean; message: string }>({ visible: false, message: '' });

  const triggerToast = (message: string) => {
    setToast({ visible: true, message });
    // Auto-dismiss toast
    setTimeout(() => {
      setToast(prev => prev.message === message ? { ...prev, visible: false } : prev);
    }, 2500);
  };

  const getTierColorClass = (tier: TierType) => {
    switch (tier) {
      case 'flourishing': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'growing': return 'bg-teal-500/10 border-teal-500/30 text-teal-400';
      case 'developing': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'emerging': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
      default: return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
    }
  };

  const handleCopyLink = () => {
    const slug = config.slug || username.toLowerCase();
    const url = `https://mirrorscore.app/p/${slug}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    triggerToast(`Copied Profile Bio Link to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleDisplay = (field: keyof typeof config.display_config.show_domain_tiers) => {
    const newConfig: PublicProfileConfig = {
      ...config,
      display_config: {
        ...config.display_config,
        show_domain_tiers: {
          ...config.display_config.show_domain_tiers,
          [field]: !config.display_config.show_domain_tiers[field]
        }
      }
    };
    onUpdateConfig(newConfig);
  };

  const handleToggleGeneralDisplay = (field: 'show_overall_tier' | 'show_growth_trajectory' | 'show_active_mission_count') => {
    const newConfig: PublicProfileConfig = {
      ...config,
      display_config: {
        ...config.display_config,
        [field]: !config.display_config[field]
      }
    };
    onUpdateConfig(newConfig);
  };

  const handleVisibilityChange = (vis: 'public' | 'link_only' | 'private') => {
    const newConfig: PublicProfileConfig = {
      ...config,
      visibility: vis
    };
    onUpdateConfig(newConfig);
  };

  const handleSaveStatement = () => {
    const newConfig: PublicProfileConfig = {
      ...config,
      display_config: {
        ...config.display_config,
        commitment_statement: statement
      }
    };
    onUpdateConfig(newConfig);
    setSuccessMsg('Your growth commitment statement has been saved.');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const displaySlug = config.slug || username.toLowerCase();
  const profileUrl = `https://mirrorscore.app/p/${displaySlug}`;

  const domains = [
    { key: 'emotional_intelligence', label: 'Emotional Intelligence (EQ)' },
    { key: 'conflict_resolution', label: 'Conflict Style' },
    { key: 'consistency_integrity', label: 'Consistency & Integrity' },
    { key: 'empathy_others_orientation', label: 'Empathy & Others-Orientation' },
    { key: 'growth_adaptability', label: 'Growth & Adaptability' },
    { key: 'communication_quality', label: 'Communication Quality' },
  ];

  return (
    <div id="public-profile-settings-view" className="grid grid-cols-1 md:grid-cols-12 gap-6 max-w-4xl mx-auto pb-12 relative">
      
      {/* Subtle Toast Notification Overlay */}
      {toast.visible && (
        <div
          id="copy-toast-notification"
          className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 flex items-center gap-3 bg-zinc-900 border border-teal-500/30 text-white rounded-2xl px-4 py-3.5 shadow-2xl max-w-sm pointer-events-auto animate-in fade-in slide-in-from-bottom-4 duration-300"
        >
          <div className="w-6 h-6 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <div className="space-y-0.5 text-left">
            <span className="text-xs font-semibold text-zinc-100 block">Copy Succeeded</span>
            <span className="text-[10px] text-zinc-400 block font-mono truncate max-w-[200px]">{toast.message}</span>
          </div>
        </div>
      )}

      {/* LEFT COLUMN: Controls & Configurations (6 cols on md) */}
      <div id="controls-panel" className="md:col-span-6 space-y-5 text-left">
        
        {/* Visibility Card */}
        <div id="visibility-card" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4.5 h-4.5 text-teal-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Bio Link Visibility Settings</h3>
          </div>
          <p className="text-xs text-zinc-400">Control who can access your scored communication metrics.</p>
          
          <div id="visibility-options" className="grid grid-cols-3 gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800/60">
            {(['private', 'link_only', 'public'] as const).map((vis) => (
              <button
                key={vis}
                id={`vis-btn-${vis}`}
                onClick={() => handleVisibilityChange(vis)}
                className={`py-2 text-[10px] font-mono rounded-lg uppercase font-bold transition-all cursor-pointer ${
                  config.visibility === vis
                    ? 'bg-zinc-800 text-teal-400 border border-zinc-700/50'
                    : 'text-zinc-500 hover:text-white border border-transparent'
                }`}
              >
                {vis.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div className="text-[10px] text-zinc-500 font-mono leading-relaxed bg-zinc-950 p-3 rounded-xl border border-zinc-900">
            {config.visibility === 'private' && '🔒 Private Mode: Your bio profile link is disabled and returns a 404.'}
            {config.visibility === 'link_only' && '🔗 Link-Only Mode: Anyone with your specific profile link can view it. Excluded from Google/search engine crawlers.'}
            {config.visibility === 'public' && '🌍 Fully Public Mode: Search engines can index your profile, and it is searchable globally.'}
          </div>

          {/* Shareable Link Block and Primary Copy Action */}
          <div className="pt-2 space-y-2">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Your Public Address</span>
            <div className="bg-zinc-950 p-2.5 rounded-xl border border-zinc-900 flex items-center justify-between gap-3 overflow-hidden">
              <span className="text-xs text-zinc-400 truncate select-all px-1 font-mono">{profileUrl}</span>
              <button
                id="copy-link-icon-btn"
                onClick={handleCopyLink}
                title="Copy Link to Clipboard"
                className="p-2 min-h-[36px] min-w-[36px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-lg text-teal-400 flex items-center justify-center transition-colors cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Clipboard className="w-4 h-4" />}
              </button>
            </div>

            {config.visibility !== 'private' ? (
              <button
                id="copy-share-link-btn"
                onClick={handleCopyLink}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-semibold rounded-xl transition-all cursor-pointer shadow-lg mt-1"
              >
                <Share2 className="w-4 h-4" />
                <span>Copy Share Link</span>
              </button>
            ) : (
              <div className="text-[10px] text-zinc-500 font-mono text-center p-2.5 bg-zinc-950/40 border border-zinc-900/60 rounded-xl mt-1">
                ⚠️ Enable Public or Link-Only visibility to activate your Share Link.
              </div>
            )}
          </div>
        </div>

        {/* Display Toggles Card */}
        <div id="display-toggles-card" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4.5 h-4.5 text-teal-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Metric Visibility Configuration</h3>
          </div>
          <p className="text-xs text-zinc-400">Choose exactly which high-level metrics and individual domain scores are visible to others on your bio link.</p>
          
          {/* General Metrics Section */}
          <div className="space-y-2 border-b border-zinc-800 pb-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">General Indicators</span>
            
            {/* Overall Tier */}
            <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-zinc-300 block">Overall Score Tier</span>
                <span className="text-[10px] text-zinc-500 font-mono block">Overall classification ({scan.synthesis.overall_tier})</span>
              </div>
              <button
                id="toggle-overall-tier-btn"
                onClick={() => handleToggleGeneralDisplay('show_overall_tier')}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {config.display_config.show_overall_tier ? (
                  <ToggleRight className="w-8 h-8 text-teal-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-zinc-700" />
                )}
              </button>
            </div>

            {/* Growth Trajectory */}
            <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-zinc-300 block">Progression Trajectory</span>
                <span className="text-[10px] text-zinc-500 font-mono block">Scanned delta progress indicators</span>
              </div>
              <button
                id="toggle-growth-trajectory-btn"
                onClick={() => handleToggleGeneralDisplay('show_growth_trajectory')}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {config.display_config.show_growth_trajectory ? (
                  <ToggleRight className="w-8 h-8 text-teal-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-zinc-700" />
                )}
              </button>
            </div>

            {/* Active Mission Count */}
            <div className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl">
              <div className="space-y-0.5">
                <span className="text-xs font-semibold text-zinc-300 block">Active Mission Count</span>
                <span className="text-[10px] text-zinc-500 font-mono block">Number of self-assigned growth tasks</span>
              </div>
              <button
                id="toggle-mission-count-btn"
                onClick={() => handleToggleGeneralDisplay('show_active_mission_count')}
                className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                {config.display_config.show_active_mission_count ? (
                  <ToggleRight className="w-8 h-8 text-teal-400" />
                ) : (
                  <ToggleLeft className="w-8 h-8 text-zinc-700" />
                )}
              </button>
            </div>
          </div>

          {/* Domain Specific Toggles */}
          <div id="domain-toggles-list" className="space-y-2 pt-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block">Individual Domain Tiers</span>
            {domains.map((dom) => {
              const score = (scan.chain_results as any)[dom.key]?.domain_score || 0;
              const isShown = (config.display_config.show_domain_tiers as any)[dom.key];
              const isFormative = score < 5.5;

              return (
                <div
                  key={dom.key}
                  id={`toggle-row-${dom.key}`}
                  className="flex items-center justify-between p-2.5 bg-zinc-950 border border-zinc-900 rounded-xl"
                >
                  <div className="space-y-0.5 max-w-[70%]">
                    <span className="text-xs font-semibold text-zinc-300 block leading-tight">{dom.label}</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] text-zinc-500 font-mono">Score: {score.toFixed(1)}</span>
                      {isFormative && (
                        <span className="text-[8px] font-mono text-amber-500 bg-amber-500/5 border border-amber-500/10 px-1 rounded uppercase">
                          ⚠️ Formative Score
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    id={`toggle-btn-${dom.key}`}
                    onClick={() => handleToggleDisplay(dom.key as any)}
                    className="text-zinc-400 hover:text-white transition-colors cursor-pointer shrink-0"
                    title={`Toggle visibility for ${dom.label}`}
                  >
                    {isShown ? (
                      <ToggleRight className="w-8 h-8 text-teal-400" />
                    ) : (
                      <ToggleLeft className="w-8 h-8 text-zinc-700" />
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Commitment Statement Card */}
        <div id="commitment-statement-card" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 md:p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="w-4.5 h-4.5 text-teal-400" />
            <h3 className="text-sm font-semibold text-zinc-200">Write a Growth Commitment</h3>
          </div>
          <p className="text-xs text-zinc-400">Personalize your public profile with a short human statement about your relational growth goals. (No AI generation allowed here).</p>
          
          <div className="space-y-2">
            <textarea
              id="commitment-text"
              placeholder="e.g. I am actively auditing my communication patterns. Currently working to slow down my responses in tense debates and practice active listening. Seeking clarity and mutual respect."
              value={statement}
              onChange={(e) => setStatement(e.target.value)}
              maxLength={280}
              rows={4}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-teal-500 font-sans leading-relaxed"
            />
            <div className="flex justify-between items-center text-[10px] font-mono text-zinc-500">
              <span>Characters remaining: {280 - statement.length}</span>
              <button
                id="save-statement-btn"
                onClick={handleSaveStatement}
                className="px-3.5 py-2 bg-teal-500 text-zinc-950 font-bold rounded-lg hover:bg-teal-400 transition-colors cursor-pointer"
              >
                Save Statement
              </button>
            </div>
            {successMsg && (
              <p className="text-[10px] font-mono text-emerald-400 mt-1">{successMsg}</p>
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Real-time Profile Preview (6 cols on md) */}
      <div id="preview-panel" className="md:col-span-6 space-y-4">
        <div className="flex justify-between items-center px-2">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Live Bio-Link Preview</span>
          {config.visibility !== 'private' && (
            <button
              id="copy-bio-link-btn"
              onClick={handleCopyLink}
              className="text-[10px] font-mono text-teal-400 flex items-center gap-1 hover:underline cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Clipboard className="w-3 h-3" />}
              <span>{copied ? 'Copied URL!' : 'Copy Link'}</span>
            </button>
          )}
        </div>

        {/* Outer Phone Mockup Frame */}
        <div id="phone-frame" className="border-4 border-zinc-800 bg-zinc-950 rounded-[32px] p-1.5 shadow-2xl relative overflow-hidden aspect-[9/16] max-w-[320px] mx-auto">
          {/* Phone Speaker Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-800 rounded-b-xl z-20" />
          
          {/* Mock Screen Content */}
          <div id="mock-screen" className="bg-zinc-950 h-full rounded-[26px] overflow-y-auto px-4 py-8 space-y-5 text-left custom-scrollbar">
            
            {/* Header: Verified badge */}
            <div id="mock-screen-header" className="flex flex-col items-center text-center space-y-1.5 pt-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-400 to-emerald-500 flex items-center justify-center font-bold text-zinc-950 text-sm font-mono shadow-md">
                {username.slice(0, 2).toUpperCase()}
              </div>
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-white block">@{username.toLowerCase()}</span>
                <div className="flex items-center gap-1 justify-center bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  <span className="text-[8px] font-mono font-bold text-teal-400 uppercase tracking-wider">Verified Profile</span>
                </div>
              </div>
            </div>

            {/* Overall Tier Card (Controlled by toggle) */}
            {config.display_config.show_overall_tier && (
              <div id="mock-overall-tier" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 text-center space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Relational Communication Tier</span>
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-mono font-bold border uppercase ${getTierColorClass(scan.synthesis.overall_tier)}`}>
                  {scan.synthesis.overall_tier}
                </span>
                <p className="text-[10px] text-zinc-400 leading-relaxed font-sans mt-1">
                  Audit verified across Twitter/Reddit contributions on {new Date().toLocaleDateString()}.
                </p>
              </div>
            )}

            {/* Commitment Statement inside mockup */}
            {config.display_config.commitment_statement && (
              <div id="mock-commitment" className="bg-zinc-900 border border-zinc-850 p-3.5 rounded-2xl space-y-1">
                <span className="text-[8px] font-mono text-teal-400 uppercase tracking-wider block">My Growth Statement</span>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans italic pr-1">
                  "{config.display_config.commitment_statement}"
                </p>
              </div>
            )}

            {/* General Indicators Inside Mockup */}
            {(config.display_config.show_active_mission_count || config.display_config.show_growth_trajectory) && (
              <div className="space-y-1.5">
                <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Profile Diagnostics</span>
                <div className="grid grid-cols-1 gap-1.5">
                  {config.display_config.show_active_mission_count && (
                    <div id="mock-mission-count" className="bg-zinc-900 border border-zinc-850 p-2.5 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-zinc-300">Active Growth Missions</span>
                      <span className="text-xs font-bold font-mono text-teal-400 bg-teal-400/10 border border-teal-400/20 px-2 py-0.5 rounded-full">
                        {scan.growth_missions?.filter(m => m.status === 'active').length || 0}
                      </span>
                    </div>
                  )}
                  {config.display_config.show_growth_trajectory && (
                    <div id="mock-trajectory" className="bg-zinc-900 border border-zinc-850 p-2.5 rounded-xl flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-zinc-300">Progression Trajectory</span>
                      <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        📈 Stable Growth
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Public Domains list (Controlled by toggles) */}
            <div id="mock-domains-section" className="space-y-1.5">
              <span className="text-[8px] font-mono text-zinc-500 uppercase tracking-wider block">Verified Dimensions</span>
              <div className="space-y-1.5">
                {domains.map((dom) => {
                  const score = (scan.chain_results as any)[dom.key]?.domain_score || 0;
                  const isShown = (config.display_config.show_domain_tiers as any)[dom.key];
                  const tier = score >= 8.5 ? 'flourishing' : score >= 7.0 ? 'growing' : score >= 5.5 ? 'developing' : score >= 4.0 ? 'emerging' : 'formative';
                  
                  // Hide if unchecked
                  if (!isShown) return null;

                  return (
                    <div
                      key={dom.key}
                      className="bg-zinc-900 border border-zinc-850 p-2.5 rounded-xl flex items-center justify-between animate-in fade-in duration-200"
                    >
                      <span className="text-[10px] font-semibold text-zinc-300 truncate max-w-[140px]">{dom.label}</span>
                      <span className={`text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${getTierColorClass(tier)}`}>
                        {tier}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mandatory Disclaimers */}
            <div id="mock-disclaimer" className="pt-4 border-t border-zinc-900 space-y-1">
              <span className="text-[8px] font-mono text-zinc-600 block uppercase">SYSTEM DISCLAIMER</span>
              <p className="text-[8px] text-zinc-600 leading-normal">
                MirrorScore evaluates self-submitted and public data. It is not a clinical assessment, diagnostic aid, or professional evaluation. Participation in MirrorScore audits is entirely voluntary.
              </p>
              <div className="text-[8px] text-zinc-700 font-mono pt-1">
                © {new Date().getFullYear()} MirrorScore.app
              </div>
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}
