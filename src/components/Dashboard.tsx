/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Award, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  CheckSquare, 
  RefreshCw, 
  Bookmark, 
  Star, 
  ArrowUpRight, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  FileText,
  Lock,
  Unlock,
  Heart,
  ShieldCheck
} from 'lucide-react';
import { ScanResult, TierType, GrowthMission, PublicProfileConfig } from '../types';
import { exportScanToPDF } from '../utils/pdfExport';

interface DashboardProps {
  scan: ScanResult;
  scans: ScanResult[];
  username: string;
  profileConfig?: PublicProfileConfig;
  onUpdateMissions: (updatedMissions: GrowthMission[]) => void;
  onRescanRequested: () => void;
}

export default function Dashboard({ scan, scans, username, profileConfig, onUpdateMissions, onRescanRequested }: DashboardProps) {
  const [expandedDomain, setExpandedDomain] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const getTierColor = (tier: TierType) => {
    switch (tier) {
      case 'flourishing': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'growing': return 'text-teal-400 bg-teal-500/10 border-teal-500/20';
      case 'developing': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'emerging': return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
      default: return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    }
  };

  const getScoreColorClass = (score: number) => {
    if (score >= 8.5) return 'text-emerald-400';
    if (score >= 7.0) return 'text-teal-400';
    if (score >= 5.5) return 'text-amber-400';
    if (score >= 4.0) return 'text-orange-400';
    return 'text-rose-400';
  };

  const toggleDomain = (domainKey: string) => {
    setExpandedDomain((prev) => (prev === domainKey ? null : domainKey));
  };

  const handleMissionStatus = (missionId: string, action: 'completed' | 'skipped' | 'active') => {
    const updated = scan.growth_missions.map((m) => {
      if (m.mission_id === missionId) {
        return {
          ...m,
          status: action,
          completed_at: action === 'completed' ? new Date().toISOString() : null,
        };
      }
      return m;
    });
    onUpdateMissions(updated);
  };

  // Maps clean label descriptors for our dot-notation target dimensions
  const formatDimensionLabel = (dotNotation: string) => {
    const parts = dotNotation.split('.');
    if (parts.length < 2) return dotNotation;
    return parts[1].replace(/_/g, ' ').toUpperCase();
  };

  const handlePDFDownload = () => {
    setIsExporting(true);
    try {
      exportScanToPDF(scan, username, profileConfig);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const badges = (() => {
    const list = [
      {
        id: 'consistent_communicator',
        name: 'Consistent Communicator',
        desc: 'Audit verified across consecutive scans without score degradation.',
        icon: 'Award',
        unlocked: false,
        req: '2+ consecutive scans with stable or increasing overall score.',
        currentProgress: '0 scans',
      },
      {
        id: 'conflict_pro',
        name: 'Conflict Resolution Pro',
        desc: 'Achieved a Conflict Style score of 7.5 or higher, or show a +1.0 improvement.',
        icon: 'ShieldCheck',
        unlocked: false,
        req: 'Conflict Style score >= 7.5 or dynamic increase of +1.0.',
        currentProgress: 'Current: 0.0',
      },
      {
        id: 'empathy_architect',
        name: 'Empathy Architect',
        desc: 'Unlock with an Empathy & Others-Orientation score of 7.5 or higher.',
        icon: 'Heart',
        unlocked: false,
        req: 'Empathy & Others-Orientation score >= 7.5.',
        currentProgress: 'Current: 0.0',
      },
      {
        id: 'integrity_guardian',
        name: 'Integrity Guardian',
        desc: 'Unlock with a Consistency & Integrity score of 7.5 or higher.',
        icon: 'Star',
        unlocked: false,
        req: 'Consistency & Integrity score >= 7.5.',
        currentProgress: 'Current: 0.0',
      },
    ];

    // Check scans history
    const sorted = [...scans].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    const count = sorted.length;

    // 1. Consistent Communicator
    let consistentStreak = 0;
    if (count >= 1) {
      consistentStreak = 1;
      for (let i = 1; i < count; i++) {
        if (sorted[i].synthesis.overall_mirrorscore >= sorted[i - 1].synthesis.overall_mirrorscore) {
          consistentStreak++;
        } else {
          consistentStreak = 1; // Reset streak if score dropped
        }
      }
    }
    list[0].unlocked = count >= 2 && consistentStreak >= 2;
    list[0].currentProgress = `${consistentStreak} consecutive scan${consistentStreak !== 1 ? 's' : ''}`;

    // 2. Conflict Pro
    const latestConflict = (scan.chain_results as any).conflict_resolution?.domain_score || 0;
    let conflictImproved = false;
    if (count >= 2) {
      const prevConflict = (sorted[count - 2].chain_results as any).conflict_resolution?.domain_score || 0;
      if (latestConflict - prevConflict >= 1.0) {
        conflictImproved = true;
      }
    }
    list[1].unlocked = latestConflict >= 7.5 || conflictImproved;
    list[1].currentProgress = `Current EQ: ${latestConflict.toFixed(1)}/10`;

    // 3. Empathy Architect
    const latestEmpathy = (scan.chain_results as any).empathy_others_orientation?.domain_score || 0;
    list[2].unlocked = latestEmpathy >= 7.5;
    list[2].currentProgress = `Current: ${latestEmpathy.toFixed(1)}/10`;

    // 4. Integrity Guardian
    const latestIntegrity = (scan.chain_results as any).consistency_integrity?.domain_score || 0;
    list[3].unlocked = latestIntegrity >= 7.5;
    list[3].currentProgress = `Current: ${latestIntegrity.toFixed(1)}/10`;

    return list;
  })();

  const renderBadgeIcon = (iconName: string, unlocked: boolean) => {
    const cls = `w-6 h-6 ${unlocked ? 'text-teal-400' : 'text-zinc-600'}`;
    switch (iconName) {
      case 'Award': return <Award className={cls} />;
      case 'ShieldCheck': return <ShieldCheck className={cls} />;
      case 'Heart': return <Heart className={cls} />;
      default: return <Star className={cls} />;
    }
  };

  const domains = [
    { key: 'emotional_intelligence', label: 'Emotional Intelligence (EQ)', desc: 'Ability to understand, regulate, and express empathy in writing.' },
    { key: 'conflict_resolution', label: 'Conflict Style', desc: 'Dispute de-escalation, constructive disagreement, and resolution capacity.' },
    { key: 'consistency_integrity', label: 'Consistency & Integrity', desc: 'Value alignment and accountability when communication is challenged.' },
    { key: 'empathy_others_orientation', label: 'Empathy & Others-Orientation', desc: 'Relational generosity and dignity given to partners or third-parties.' },
    { key: 'growth_adaptability', label: 'Growth & Adaptability', desc: 'Longitudinal learning and resilience narrative across posts.' },
    { key: 'communication_quality', label: 'Communication Quality', desc: 'Tone calibration, active listening cues, and direct expression.' },
  ];

  return (
    <div id="dashboard-view" className="space-y-6 max-w-2xl mx-auto pb-12">
      
      {/* 0. Top Action bar */}
      <div id="dashboard-top-bar" className="flex justify-between items-center bg-zinc-900 border border-zinc-800 px-4 py-3 rounded-2xl">
        <span className="text-[10px] font-mono text-zinc-400 tracking-wider">SECURE CLIENT CODESPACE</span>
        <button
          id="export-pdf-btn"
          onClick={handlePDFDownload}
          disabled={isExporting}
          className="px-3.5 py-1.5 bg-teal-500/10 hover:bg-teal-500 text-teal-400 hover:text-zinc-950 font-bold rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{isExporting ? 'Exporting...' : 'Export PDF Audit Report'}</span>
        </button>
      </div>

      {/* 1. Main Score Card */}
      <div id="score-summary-card" className="relative overflow-hidden bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-8 shadow-2xl">
        {/* Glow decoration */}
        <div className="absolute top-0 right-0 w-36 h-36 bg-teal-500/10 rounded-full blur-3xl" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div id="score-meta-text" className="space-y-1">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest block">Audit Verified • Scan #{scan.scan_number}</span>
            <h2 className="text-2xl font-bold tracking-tight text-white font-sans">Your MirrorScore</h2>
            <p className="text-xs text-zinc-400 max-w-sm">
              Analyzing {scan.content_items_analyzed} items across{' '}
              <strong className="text-zinc-300 font-mono uppercase">{scan.platforms_analyzed.join(', ')}</strong>.
            </p>
          </div>

          <div id="score-display-box" className="flex items-center gap-4 bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80">
            <div className="text-center">
              <span className="text-4xl font-black tracking-tighter text-white font-sans">{scan.synthesis.overall_mirrorscore.toFixed(1)}</span>
              <span className="text-xs text-zinc-500 block font-mono">/ 10</span>
            </div>
            <div className="w-[1px] h-10 bg-zinc-800" />
            <div>
              <span className={`px-2.5 py-1 text-xs font-mono font-bold rounded-full uppercase border ${getTierColor(scan.synthesis.overall_tier)}`}>
                {scan.synthesis.overall_tier}
              </span>
              <span className="text-[10px] text-zinc-500 block mt-1">Overall Growth Tier</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Narrative Overview & Insights */}
      <div id="narrative-insight-card" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-400 animate-pulse" />
          <span>Behavioral Ingestion Narrative</span>
        </h3>
        <p className="text-xs text-zinc-300 leading-relaxed font-sans whitespace-pre-wrap">
          {scan.synthesis.narrative_summary}
        </p>

        {/* Strengths & Opportunities side-by-side / stacked */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
          <div id="strengths-box" className="bg-zinc-950 p-4 border border-zinc-800/50 rounded-2xl space-y-2">
            <h4 className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 fill-emerald-400" />
              <span>Verified Strengths</span>
            </h4>
            <ul className="space-y-1.5">
              {scan.synthesis.strength_highlights.map((h, i) => (
                <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5 leading-relaxed">
                  <span className="text-emerald-400 select-none">•</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          <div id="opportunities-box" className="bg-zinc-950 p-4 border border-zinc-800/50 rounded-2xl space-y-2">
            <h4 className="text-[11px] font-mono font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5" />
              <span>Growth Opportunities</span>
            </h4>
            <ul className="space-y-1.5">
              {scan.synthesis.growth_opportunities.map((o, i) => (
                <li key={i} className="text-xs text-zinc-300 flex items-start gap-1.5 leading-relaxed">
                  <span className="text-teal-400 select-none">•</span>
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 2.5. Unlocked Achievements Badges System */}
      <div id="unlocked-achievements-card" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4 text-left">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
            <Award className="w-4.5 h-4.5 text-teal-400" />
            <span>Visual Relational Achievements</span>
          </h3>
          <span className="text-[10px] font-mono text-zinc-500 bg-zinc-950 border border-zinc-850 px-2 py-0.5 rounded-full">
            {badges.filter(b => b.unlocked).length} / {badges.length} Unlocked
          </span>
        </div>
        <p className="text-xs text-zinc-400">
          Unlocks and tracks visual milestones based on consecutive scan improvement streaks and domain health metrics.
        </p>

        <div id="achievements-badges-grid" className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
          {badges.map((b) => (
            <div
              key={b.id}
              id={`badge-card-${b.id}`}
              className={`relative overflow-hidden p-4 rounded-2xl border transition-all duration-300 ${
                b.unlocked
                  ? 'bg-gradient-to-br from-zinc-900 via-zinc-900 to-teal-950/20 border-teal-500/20 shadow-lg shadow-teal-950/10'
                  : 'bg-zinc-950/50 border-zinc-900 opacity-60'
              }`}
            >
              {/* Corner status glow for unlocked */}
              {b.unlocked && (
                <div className="absolute -top-10 -right-10 w-20 h-20 bg-teal-400/5 rounded-full blur-xl pointer-events-none" />
              )}

              <div className="flex items-start gap-3.5">
                {/* Visual Icon Container */}
                <div className={`p-2.5 rounded-xl border shrink-0 transition-all ${
                  b.unlocked
                    ? 'bg-teal-500/10 border-teal-500/30 shadow-inner'
                    : 'bg-zinc-900 border-zinc-850'
                }`}>
                  {renderBadgeIcon(b.icon, b.unlocked)}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-bold truncate ${b.unlocked ? 'text-zinc-100' : 'text-zinc-500'}`}>
                      {b.name}
                    </span>
                    <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded shrink-0 ${
                      b.unlocked
                        ? 'bg-teal-500/15 text-teal-400 border border-teal-500/20'
                        : 'bg-zinc-900 text-zinc-600 border border-zinc-850/60'
                    }`}>
                      {b.unlocked ? 'Unlocked' : 'Locked'}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-normal line-clamp-2">
                    {b.desc}
                  </p>
                  
                  {/* Progress Line */}
                  <div className="pt-1 flex items-center justify-between text-[8px] font-mono">
                    <span className="text-zinc-500">{b.req}</span>
                    <span className={b.unlocked ? 'text-teal-400 font-bold' : 'text-zinc-500'}>
                      {b.currentProgress}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Deep Domain Explorations */}
      <div id="domains-section" className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">6 Analyzed Communication Domains</h3>
          <span className="text-[10px] text-zinc-500">Click to expand metrics & notes</span>
        </div>

        <div className="space-y-2">
          {domains.map((domain) => {
            const domainData = (scan.chain_results as any)[domain.key];
            const isExpanded = expandedDomain === domain.key;
            const score = domainData?.domain_score || 0;
            const tier = score >= 8.5 ? 'flourishing' : score >= 7.0 ? 'growing' : score >= 5.5 ? 'developing' : score >= 4.0 ? 'emerging' : 'formative';

            return (
              <div
                key={domain.key}
                id={`domain-accordion-${domain.key}`}
                className="bg-zinc-900 border border-zinc-800/80 rounded-2xl overflow-hidden transition-all"
              >
                {/* Header Row */}
                <button
                  id={`domain-header-btn-${domain.key}`}
                  onClick={() => toggleDomain(domain.key)}
                  className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-950/40 transition-colors cursor-pointer"
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-semibold text-zinc-200 block">{domain.label}</span>
                    <span className="text-[10px] text-zinc-500 block leading-relaxed pr-6">{domain.desc}</span>
                  </div>
                  
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <span className={`text-sm font-bold font-mono ${getScoreColorClass(score)}`}>
                        {score ? score.toFixed(1) : 'N/A'}
                      </span>
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ml-2 uppercase border ${getTierColor(tier)}`}>
                        {tier}
                      </span>
                    </div>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-400" />}
                  </div>
                </button>

                {/* Sub-Dimensions Accordion */}
                {isExpanded && domainData?.dimensions && (
                  <div id={`domain-sub-${domain.key}`} className="border-t border-zinc-800/50 bg-zinc-950/60 p-4 md:p-5 space-y-4">
                    {Object.entries(domainData.dimensions).map(([subKey, val]: [string, any]) => (
                      <div key={subKey} id={`sub-dim-${subKey}`} className="space-y-1.5 bg-zinc-950 p-3.5 border border-zinc-900 rounded-xl">
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="font-semibold text-zinc-300 tracking-tight">{subKey.replace(/_/g, ' ').toUpperCase()}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-zinc-500 font-mono text-[10px]">Confidence: {Math.floor(val.confidence * 100)}%</span>
                            <span className={`font-bold font-mono ${getScoreColorClass(val.score)}`}>{val.score.toFixed(1)} / 10</span>
                          </div>
                        </div>
                        <p className="text-xs text-zinc-400 leading-relaxed italic pr-2">
                          "{val.analyst_note}"
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Coaching Growth Missions */}
      <div id="coaching-missions-section" className="space-y-4 pt-4">
        <div id="coaching-header-row" className="flex items-center justify-between">
          <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Your growth roadmap</h3>
          <span className="text-[10px] text-zinc-500 font-mono">3 Actions assigned</span>
        </div>

        <div id="missions-list" className="space-y-4">
          {scan.growth_missions.map((mission) => {
            const isCompleted = mission.status === 'completed';
            const isSkipped = mission.status === 'skipped';

            return (
              <div
                key={mission.mission_id}
                id={`mission-card-${mission.mission_id}`}
                className={`bg-zinc-900 border rounded-2xl p-5 md:p-6 transition-all ${
                  isCompleted
                    ? 'border-emerald-500/30 opacity-75'
                    : isSkipped
                    ? 'border-zinc-800/60 opacity-50'
                    : 'border-zinc-800'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 uppercase tracking-wider">
                      {formatDimensionLabel(mission.target_dimension)}
                    </span>
                    <h4 className={`text-base font-bold tracking-tight text-white ${isCompleted ? 'line-through text-zinc-400' : ''}`}>
                      {mission.title}
                    </h4>
                  </div>

                  {/* Status Indicator Badging */}
                  {isCompleted && (
                    <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full uppercase">
                      COMPLETED
                    </span>
                  )}
                  {isSkipped && (
                    <span className="text-[10px] font-mono font-bold text-zinc-500 bg-zinc-800 border border-zinc-700/50 px-2.5 py-0.5 rounded-full uppercase">
                      SKIPPED
                    </span>
                  )}
                </div>

                {/* Description & Impact block */}
                {!isCompleted && !isSkipped && (
                  <div id={`mission-details-${mission.mission_id}`} className="mt-4 space-y-4 text-xs">
                    <p className="text-zinc-300 leading-relaxed">{mission.description}</p>
                    
                    <div className="p-3 bg-zinc-950 border border-zinc-800/60 rounded-xl space-y-1">
                      <strong className="font-bold text-teal-400 block font-mono text-[10px] uppercase">Why this matters:</strong>
                      <p className="text-zinc-400 leading-relaxed pr-2">{mission.why_this_matters}</p>
                    </div>

                    {/* Instead of / Try Y specific templates */}
                    {mission.specific_examples && mission.specific_examples.length > 0 && (
                      <div className="space-y-2">
                        <span className="font-semibold text-zinc-400 block font-mono text-[9px] uppercase tracking-wider">Behavioral Templates</span>
                        <div className="space-y-1.5">
                          {mission.specific_examples.map((ex, idx) => (
                            <div key={idx} className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-900 font-mono text-[10px] text-zinc-300 leading-relaxed">
                              {ex}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Success Metrics */}
                    <div className="flex items-center gap-2 text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      <span><strong className="text-zinc-300">Goal:</strong> {mission.success_indicator}</span>
                    </div>
                  </div>
                )}

                {/* Actions row */}
                <div id={`mission-actions-${mission.mission_id}`} className="mt-5 pt-3 border-t border-zinc-800/50 flex gap-2">
                  {!isCompleted && !isSkipped ? (
                    <>
                      <button
                        id={`btn-complete-${mission.mission_id}`}
                        onClick={() => handleMissionStatus(mission.mission_id, 'completed')}
                        className="flex-1 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-zinc-950 font-bold py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5 border border-emerald-500/20 hover:border-transparent"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Achieved</span>
                      </button>
                      <button
                        id={`btn-skip-${mission.mission_id}`}
                        onClick={() => handleMissionStatus(mission.mission_id, 'skipped')}
                        className="px-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-400 hover:text-zinc-200 py-2 rounded-lg text-xs transition-colors cursor-pointer"
                      >
                        Skip
                      </button>
                    </>
                  ) : (
                    <button
                      id={`btn-reset-${mission.mission_id}`}
                      onClick={() => handleMissionStatus(mission.mission_id, 'active')}
                      className="text-[10px] font-mono text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      <span>Re-activate and pursue this mission</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recalibrate / Rescan Prompt */}
      <div id="rescan-prompt-box" className="text-center pt-8">
        <button
          id="rescan-request-btn"
          onClick={onRescanRequested}
          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 font-medium px-5 py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center gap-2 mx-auto shadow-lg"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Upload or Run A New Scan</span>
        </button>
        <p className="text-[10px] text-zinc-500 mt-2 font-mono">Most users scan every 30 to 90 days to verify behavioral deltas.</p>
      </div>

    </div>
  );
}
