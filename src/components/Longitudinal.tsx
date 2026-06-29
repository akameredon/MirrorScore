/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrendingUp, Award, Calendar, Activity, CheckSquare, Plus, RefreshCw, Sparkles, HelpCircle, Eye, EyeOff } from 'lucide-react';
import { ScanResult, DomainScores } from '../types';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface LongitudinalProps {
  scans: ScanResult[];
  onAddSimulatedScan: () => void;
}

export default function Longitudinal({ scans, onAddSimulatedScan }: LongitudinalProps) {
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    overall: true,
    eq: true,
    conflict: true,
    consistency: false,
    empathy: false,
    growth: false,
    comm: false,
  });

  // If we have multiple scans, sort them by date
  const sortedScans = [...scans].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  
  // Calculate historical deltas between latest and earliest
  const hasMultiple = sortedScans.length > 1;
  const latestScan = sortedScans[sortedScans.length - 1];
  const earliestScan = sortedScans[0];
  
  const overallDelta = hasMultiple 
    ? latestScan.synthesis.overall_mirrorscore - earliestScan.synthesis.overall_mirrorscore
    : 0;

  // Domain score trajectory helpers
  const getDomainDeltas = () => {
    if (!hasMultiple) return [];
    
    const domains = [
      { key: 'emotional_intelligence', label: 'EQ' },
      { key: 'conflict_resolution', label: 'Conflict Style' },
      { key: 'consistency_integrity', label: 'Consistency' },
      { key: 'empathy_others_orientation', label: 'Empathy' },
      { key: 'growth_adaptability', label: 'Growth' },
      { key: 'communication_quality', label: 'Comm Quality' },
    ];

    return domains.map((d) => {
      const earlyScore = (earliestScan.chain_results as any)[d.key]?.domain_score || 0;
      const lateScore = (latestScan.chain_results as any)[d.key]?.domain_score || 0;
      return {
        label: d.label,
        earlyScore,
        lateScore,
        delta: lateScore - earlyScore,
      };
    });
  };

  const domainDeltas = getDomainDeltas();

  // Recharts Chart Data Formatting
  const chartData = sortedScans.map((scan) => {
    return {
      name: `Scan #${scan.scan_number}`,
      date: new Date(scan.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      overall: parseFloat(scan.synthesis.overall_mirrorscore.toFixed(1)),
      eq: parseFloat(((scan.chain_results as any).emotional_intelligence?.domain_score || 0).toFixed(1)),
      conflict: parseFloat(((scan.chain_results as any).conflict_resolution?.domain_score || 0).toFixed(1)),
      consistency: parseFloat(((scan.chain_results as any).consistency_integrity?.domain_score || 0).toFixed(1)),
      empathy: parseFloat(((scan.chain_results as any).empathy_others_orientation?.domain_score || 0).toFixed(1)),
      growth: parseFloat(((scan.chain_results as any).growth_adaptability?.domain_score || 0).toFixed(1)),
      comm: parseFloat(((scan.chain_results as any).communication_quality?.domain_score || 0).toFixed(1)),
    };
  });

  const toggleLine = (lineKey: string) => {
    setVisibleLines((prev) => ({
      ...prev,
      [lineKey]: !prev[lineKey],
    }));
  };

  const linesConfig = [
    { key: 'overall', label: 'Overall Score', color: '#14b8a6', active: visibleLines.overall },
    { key: 'eq', label: 'EQ (Emotional Int.)', color: '#f59e0b', active: visibleLines.eq },
    { key: 'conflict', label: 'Conflict Style', color: '#f43f5e', active: visibleLines.conflict },
    { key: 'consistency', label: 'Consistency', color: '#8b5cf6', active: visibleLines.consistency },
    { key: 'empathy', label: 'Empathy', color: '#3b82f6', active: visibleLines.empathy },
    { key: 'growth', label: 'Growth', color: '#f97316', active: visibleLines.growth },
    { key: 'comm', label: 'Communication Quality', color: '#06b6d4', active: visibleLines.comm },
  ];

  return (
    <div id="longitudinal-view" className="space-y-6 max-w-2xl mx-auto pb-12">
      
      {/* Overview header */}
      <div id="longitudinal-header" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1 text-left">
            <h2 className="text-xl font-bold text-white tracking-tight">Your Progression History</h2>
            <p className="text-xs text-zinc-400">Track behavioral changes and scan improvements over time.</p>
          </div>

          <button
            id="simulate-history-btn"
            onClick={onAddSimulatedScan}
            className="px-4 py-2 bg-teal-500/10 hover:bg-teal-500 hover:text-zinc-950 text-teal-400 font-semibold border border-teal-500/20 hover:border-transparent rounded-xl text-xs font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Simulate Progress Scan</span>
          </button>
        </div>

        {/* Delta Overview Dashboard Cards */}
        {hasMultiple ? (
          <div id="delta-metrics-grid" className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-left">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Overall Growth</span>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-lg font-black text-white">
                  {latestScan.synthesis.overall_mirrorscore.toFixed(1)}
                </span>
                <span className={`text-xs font-bold font-mono ${overallDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {overallDelta >= 0 ? `+${overallDelta.toFixed(1)}` : overallDelta.toFixed(1)}
                </span>
              </div>
            </div>

            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-left">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Total Scans</span>
              <p className="text-lg font-black text-white mt-1">{scans.length}</p>
            </div>

            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-left">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">First Audit</span>
              <p className="text-xs font-semibold text-zinc-300 mt-1.5">
                {new Date(earliestScan.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="bg-zinc-950 p-3 rounded-2xl border border-zinc-800 text-left">
              <span className="text-[10px] font-mono text-zinc-500 uppercase">Latest Audit</span>
              <p className="text-xs font-semibold text-zinc-300 mt-1.5">
                {new Date(latestScan.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex items-start gap-3 bg-zinc-950/60 p-4 border border-zinc-800/40 rounded-2xl mt-6 text-left">
            <HelpCircle className="w-5 h-5 text-zinc-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-zinc-300">Deltas require at least 2 scans</p>
              <p className="text-[11px] text-zinc-500 leading-relaxed mt-0.5">As you implement Growth Missions, your online communication will naturally adapt. Rescan in 30 days to compute deltas, or click "Simulate Progress Scan" above to preview how MirrorScore maps growth trajectory graphs.</p>
            </div>
          </div>
        )}
      </div>

      {/* Recharts Trajectory Chart Plotting */}
      <div id="trajectory-chart-card" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-zinc-200 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-teal-400" />
              <span>Multi-Domain Progression Trajectory</span>
            </h3>
            <p className="text-[11px] text-zinc-400">Interactive: Toggle metric lines below to isolate specific developmental trends.</p>
          </div>
          
          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 bg-zinc-950 px-2.5 py-1 rounded-full border border-zinc-850">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            <span>Recharts Live Engine</span>
          </div>
        </div>

        {/* Dynamic Metric Toggles */}
        <div id="trajectory-metrics-toggles" className="flex flex-wrap gap-2 pt-1">
          {linesConfig.map((cfg) => (
            <button
              key={cfg.key}
              onClick={() => toggleLine(cfg.key)}
              id={`toggle-line-${cfg.key}`}
              className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                cfg.active
                  ? 'bg-zinc-950 text-white'
                  : 'bg-zinc-950/30 text-zinc-600 border-zinc-900/60'
              }`}
              style={{
                borderColor: cfg.active ? `${cfg.color}35` : undefined,
                boxShadow: cfg.active ? `inset 0 0 4px ${cfg.color}15` : undefined
              }}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cfg.active ? cfg.color : '#27272a' }} />
              <span>{cfg.label}</span>
              {cfg.active ? (
                <Eye className="w-3 h-3 text-zinc-400 shrink-0" />
              ) : (
                <EyeOff className="w-3 h-3 text-zinc-600 shrink-0" />
              )}
            </button>
          ))}
        </div>

        {/* Recharts Container */}
        <div id="recharts-chart-wrapper" className="w-full bg-zinc-950 border border-zinc-900 rounded-2xl p-4 pt-6 h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 5, right: 10, left: -25, bottom: 5 }}
            >
              <CartesianGrid stroke="#1e1e24" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                stroke="#52525b"
                fontSize={9}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[1, 10]}
                ticks={[2, 4, 6, 8, 10]}
                stroke="#52525b"
                fontSize={9}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-xl text-xs space-y-1.5 shadow-2xl text-left">
                        <p className="font-mono text-[10px] text-zinc-500">{payload[0].payload.date} ({label})</p>
                        <div className="space-y-1">
                          {payload.map((p: any) => (
                            <div key={p.name} className="flex items-center gap-3 justify-between">
                              <span className="flex items-center gap-1.5 text-zinc-300">
                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: p.color }} />
                                {p.name}
                              </span>
                              <span className="font-mono font-bold" style={{ color: p.color }}>
                                {p.value.toFixed(1)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              {linesConfig.map((cfg) => {
                if (!cfg.active) return null;
                return (
                  <Line
                    key={cfg.key}
                    type="monotone"
                    dataKey={cfg.key}
                    name={cfg.label}
                    stroke={cfg.color}
                    strokeWidth={cfg.key === 'overall' ? 3.5 : 2}
                    activeDot={{ r: 6, strokeWidth: 1 }}
                    dot={{ r: 4, strokeWidth: 1 }}
                  />
                );
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Timeline dots indicators */}
        <div className="flex justify-between px-2 text-[9px] font-mono text-zinc-500">
          <span>First Audit ({new Date(earliestScan.created_at).toLocaleDateString()})</span>
          {hasMultiple && <span>Latest Audit ({new Date(latestScan.created_at).toLocaleDateString()})</span>}
        </div>
      </div>

      {/* 5. Domain Trajectory Grid */}
      {hasMultiple && (
        <div id="domain-trajectories-card" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">
          <h3 className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-4 text-left">
            Domain Progression Metrics
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {domainDeltas.map((d) => (
              <div
                key={d.label}
                id={`delta-card-${d.label.replace(/ /g, '-')}`}
                className="bg-zinc-950 p-3.5 border border-zinc-800 rounded-xl flex items-center justify-between"
              >
                <span className="text-xs font-semibold text-zinc-300">{d.label}</span>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-500 font-mono block">Early: {d.earlyScore.toFixed(1)}</span>
                    <span className="text-[10px] text-teal-400 font-mono block font-bold">Latest: {d.lateScore.toFixed(1)}</span>
                  </div>
                  <div className="w-[1px] h-6 bg-zinc-800" />
                  <span className={`text-xs font-bold font-mono ${d.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {d.delta >= 0 ? `+${d.delta.toFixed(1)}` : d.delta.toFixed(1)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. High-fidelity Narrative Growth Summary */}
      {hasMultiple && (
        <div id="longitudinal-narrative-card" className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 text-left space-y-3">
          <h4 className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Trajectory Shift Analysis</span>
          </h4>
          <p className="text-xs text-zinc-300 leading-relaxed leading-5">
            We processed your secondary scan delta content. There is a distinct, positive transformation in your <strong className="text-teal-400 font-semibold font-sans">Conflict Resolution</strong> vectors.
            Your early 2024 content contained high ratios of sarcasm and rapid reply-chain escalations in heated debates. In contrast, your recent 2026 data contains multiple instances where you explicitly paused to validate others' stances and seek mutual alignment.
            This structural communication change represents an impressive <strong className="text-emerald-400 font-bold font-sans">+{overallDelta.toFixed(1)} point overall rating shift</strong>, marking high self-development and relational safety.
          </p>
        </div>
      )}

    </div>
  );
}
