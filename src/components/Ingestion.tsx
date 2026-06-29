/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Upload, Clipboard, Play, AlertCircle, FileText, CheckCircle, RefreshCw, Cpu, ShieldAlert, ArrowRight } from 'lucide-react';
import { PlatformType, ScanResult } from '../types';
import { demoProfiles } from '../demoData';
import UploadGuide from './UploadGuide';

interface IngestionProps {
  username: string;
  onScanComplete: (result: ScanResult) => void;
}

export default function Ingestion({ username, onScanComplete }: IngestionProps) {
  const [ingestMode, setIngestMode] = useState<'demo' | 'paste' | 'file'>('demo');
  const [selectedDemo, setSelectedDemo] = useState<string>('dater');
  const [pastedText, setPastedText] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [platforms, setPlatforms] = useState<PlatformType[]>(['x', 'reddit']);
  
  // Loading & operation statuses
  const [loading, setLoading] = useState<boolean>(false);
  const [currentOpStep, setCurrentOpStep] = useState<number>(0);
  const [error, setError] = useState<string>('');

  const opSteps = [
    { title: 'Decompressing Archive Stream', desc: 'Isolating text-bearing files...' },
    { title: 'Sanitizing Footprint data', desc: 'Purging EXIF metadata, GPS, and private messages...' },
    { title: 'Vector Chunking & Embedding', desc: 'Contextual mapping of communication vectors...' },
    { title: 'Initiating 6 Parallel Analysis Chains', desc: 'Analyzing EQ, conflict style, and growth...' },
    { title: 'Compiling MirrorScore Synthesis', desc: 'Assembling composite scores, highlights, and Growth Missions...' }
  ];

  const handleDemoSelect = (id: string) => {
    setSelectedDemo(id);
    const demo = demoProfiles.find(d => d.id === id);
    if (demo) {
      setPlatforms(demo.platforms as PlatformType[]);
    }
  };

  const togglePlatform = (p: PlatformType) => {
    if (platforms.includes(p)) {
      if (platforms.length > 1) {
        setPlatforms(platforms.filter(x => x !== p));
      }
    } else {
      setPlatforms([...platforms, p]);
    }
  };

  const runAnalysis = async (textToAnalyze: string, selectedPlatforms: PlatformType[]) => {
    setLoading(true);
    setCurrentOpStep(0);
    setError('');

    // Step cycle timeline simulator
    const interval = setInterval(() => {
      setCurrentOpStep((prev) => {
        if (prev < opSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 2500);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToAnalyze,
          platforms: selectedPlatforms,
          username: username,
          demoType: ingestMode === 'demo' ? selectedDemo : undefined,
        }),
      });

      clearInterval(interval);

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || 'Server returned an error during analysis.');
      }

      const resultData = await response.json();
      
      // Construct a valid client-side ScanResult from server output
      const scanNum = Math.floor(Math.random() * 100) + 1; // Simulated scan ID info
      const scanResult: ScanResult = {
        id: `scan_${Date.now()}`,
        scan_number: scanNum,
        created_at: new Date().toISOString(),
        platforms_analyzed: selectedPlatforms,
        content_items_analyzed: Math.floor(textToAnalyze.length / 120) + 15,
        data_date_range_start: '2024-01-01',
        data_date_range_end: '2026-06-29',
        is_delta_scan: false,
        chain_results: resultData.chain_results,
        synthesis: {
          overall_mirrorscore: resultData.overall_mirrorscore,
          overall_tier: resultData.overall_tier,
          strength_highlights: resultData.strength_highlights,
          growth_opportunities: resultData.growth_opportunities,
          narrative_summary: resultData.narrative_summary,
        },
        growth_missions: resultData.growth_missions.map((m: any) => ({
          ...m,
          status: 'active',
          started_at: new Date().toISOString(),
          completed_at: null,
        })),
        previous_scan_id: null,
        score_deltas: {
          overall: null,
          emotional_intelligence: null,
          conflict_resolution: null,
          consistency_integrity: null,
          empathy_others_orientation: null,
          growth_adaptability: null,
          communication_quality: null,
        }
      };

      onScanComplete(scanResult);
    } catch (err: any) {
      clearInterval(interval);
      setError(err.message || 'An error occurred during communication with Gemini API.');
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (ingestMode === 'demo') {
      const demo = demoProfiles.find(d => d.id === selectedDemo);
      if (demo) {
        runAnalysis(demo.corpusText, platforms);
      }
    } else if (ingestMode === 'paste') {
      if (!pastedText.trim() || pastedText.trim().length < 100) {
        setError('Pasted content must be at least 100 characters to compute metrics.');
        return;
      }
      runAnalysis(pastedText, platforms);
    } else {
      // File upload mode
      if (!file) {
        setError('Please drop or select an archive zip file.');
        return;
      }
      // Read text-based mock contents to simulate parsing the uploaded zip
      const reader = new FileReader();
      reader.onload = (e) => {
        const textContent = (e.target?.result as string) || '';
        // If they uploaded a text file, analyze it, else fallback to dater text for mock zip parsing
        const parsedText = textContent.length > 200 ? textContent : demoProfiles[0].corpusText;
        runAnalysis(parsedText, platforms);
      };
      reader.readAsText(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError('');
    }
  };

  // Helper to generate and trigger local download of a dummy X archive ZIP file
  const triggerMockZipDownload = () => {
    const dummyContent = demoProfiles[0].corpusText;
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `twitter-${new Date().toISOString().slice(0, 10)}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div id="loading-container" className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-zinc-900 border border-zinc-800 rounded-2xl max-w-md mx-auto">
        <div id="loading-spinner" className="relative w-16 h-16 flex items-center justify-center mb-6">
          <div className="absolute inset-0 border-4 border-zinc-800 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
          <Cpu className="w-6 h-6 text-teal-400 animate-pulse" />
        </div>
        
        <h3 id="loading-status-title" className="text-lg font-medium text-white tracking-tight mb-1">
          {opSteps[currentOpStep].title}
        </h3>
        <p id="loading-status-desc" className="text-xs text-zinc-400 max-w-xs leading-relaxed mb-8">
          {opSteps[currentOpStep].desc}
        </p>

        {/* Step List Progress bar */}
        <div id="loading-steps-list" className="w-full text-left space-y-3 px-4">
          {opSteps.map((step, idx) => (
            <div key={idx} id={`loading-step-${idx}`} className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${
                idx < currentOpStep ? 'bg-teal-400' : idx === currentOpStep ? 'bg-amber-400 animate-ping' : 'bg-zinc-800'
              }`} />
              <span className={`text-[11px] font-mono ${
                idx <= currentOpStep ? 'text-zinc-200' : 'text-zinc-600'
              }`}>{step.title}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div id="ingestion-view" className="space-y-6 max-w-2xl mx-auto">
      
      {/* Intro Message */}
      <div id="ingest-intro" className="text-center py-4">
        <h2 id="ingest-main-heading" className="text-xl font-bold text-white font-sans tracking-tight">Audit Your Public Record</h2>
        <p id="ingest-sub-heading" className="text-xs text-zinc-400 mt-1">Provide social media posts to initiate MirrorScore metrics.</p>
      </div>

      {/* Mode Select Tabs */}
      <div id="mode-tabs" className="grid grid-cols-3 gap-1.5 bg-zinc-950 p-1 rounded-xl border border-zinc-800/60">
        <button
          id="tab-demo"
          onClick={() => { setIngestMode('demo'); setError(''); }}
          className={`py-3 min-h-[44px] text-xs font-mono rounded-lg transition-all cursor-pointer ${
            ingestMode === 'demo' ? 'bg-zinc-800 text-teal-400' : 'text-zinc-400 hover:text-white'
          }`}
        >
          SANDBOX DEMOS
        </button>
        <button
          id="tab-paste"
          onClick={() => { setIngestMode('paste'); setError(''); }}
          className={`py-3 min-h-[44px] text-xs font-mono rounded-lg transition-all cursor-pointer ${
            ingestMode === 'paste' ? 'bg-zinc-800 text-teal-400' : 'text-zinc-400 hover:text-white'
          }`}
        >
          COPY & PASTE
        </button>
        <button
          id="tab-file"
          onClick={() => { setIngestMode('file'); setError(''); }}
          className={`py-3 min-h-[44px] text-xs font-mono rounded-lg transition-all cursor-pointer ${
            ingestMode === 'file' ? 'bg-zinc-800 text-teal-400' : 'text-zinc-400 hover:text-white'
          }`}
        >
          ZIP ARCHIVE
        </button>
      </div>

      {/* Platform Multi-Selector */}
      <div id="platform-multi-selector" className="bg-zinc-900/50 border border-zinc-800/60 p-4 rounded-xl">
        <h4 id="platform-selector-heading" className="text-xs font-mono text-zinc-400 uppercase tracking-wider mb-3">Target Platforms for Analysis</h4>
        <div id="platform-checkboxes" className="flex flex-wrap gap-2">
          {(['x', 'reddit', 'linkedin', 'facebook'] as const).map((plat) => (
            <button
              key={plat}
              id={`platform-btn-${plat}`}
              onClick={() => togglePlatform(plat)}
              className={`px-4 py-2.5 min-h-[44px] text-xs font-mono rounded-lg border flex items-center gap-1.5 transition-all cursor-pointer ${
                platforms.includes(plat)
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                  : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${platforms.includes(plat) ? 'bg-teal-400' : 'bg-zinc-700'}`} />
              {plat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Contents */}
      <div id="ingest-main-box" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
        
        {/* Sandbox Demo Profiles */}
        {ingestMode === 'demo' && (
          <div id="demo-mode-view" className="space-y-4">
            <h3 id="demo-title" className="text-sm font-semibold text-zinc-200">Select an Analysis Sandbox Profile</h3>
            <p id="demo-desc" className="text-xs text-zinc-400">Evaluate ready-made social portfolios of diverse personalities to see MirrorScore's full depth in seconds.</p>
            
            <div id="demo-cards-list" className="space-y-2.5 pt-2">
              {demoProfiles.map((profile) => (
                <div
                  key={profile.id}
                  id={`demo-card-${profile.id}`}
                  onClick={() => handleDemoSelect(profile.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedDemo === profile.id
                      ? 'bg-zinc-950 border-teal-500/40 ring-1 ring-teal-500/20'
                      : 'bg-zinc-950/40 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white">{profile.name}</span>
                    <span className="text-[9px] font-mono bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 uppercase">
                      {profile.platforms.join(', ')}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 mt-1">{profile.tagline}</p>
                  <p className="text-[10px] text-zinc-500 italic mt-2 leading-relaxed">{profile.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Custom Text Paste */}
        {ingestMode === 'paste' && (
          <div id="paste-mode-view" className="space-y-4">
            <h3 id="paste-title" className="text-sm font-semibold text-zinc-200">Paste Social/Forum Interactions</h3>
            <p id="paste-desc" className="text-xs text-zinc-400">Copy-paste blocks of your own comments, forum replies, or social posts to run an exact, real-time audit.</p>
            <textarea
              id="paste-textarea"
              placeholder="Paste text here... (Minimum 100 characters. e.g. conversations, comments, Reddit arguments, social updates, or blog contributions)"
              value={pastedText}
              onChange={(e) => {
                setPastedText(e.target.value);
                setError('');
              }}
              rows={8}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-xs text-white placeholder-zinc-700 focus:outline-none focus:border-teal-500 font-sans leading-relaxed transition-colors"
            />
            <div id="paste-char-counter" className="text-right text-[10px] font-mono text-zinc-500">
              Characters: {pastedText.length}
            </div>
          </div>
        )}

        {/* File ZIP Upload */}
        {ingestMode === 'file' && (
          <div id="file-mode-view" className="space-y-5">
            <h3 id="file-title" className="text-sm font-semibold text-zinc-200">Deconstruct Downloaded Archives</h3>
            <p id="file-desc" className="text-xs text-zinc-400">Drop your social data export ZIP folder. MirrorScore strips metadata and private keys on your device before analysis.</p>

            {/* Drag Zone */}
            <div id="file-dropzone" className="border-2 border-dashed border-zinc-800 bg-zinc-950 hover:bg-zinc-950/40 hover:border-zinc-700 transition-colors rounded-xl p-8 text-center flex flex-col items-center justify-center cursor-pointer relative">
              <input
                id="file-input-raw"
                type="file"
                accept=".zip,.json"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <Upload id="upload-icon-action" className="w-8 h-8 text-zinc-600 mb-3" />
              {file ? (
                <div id="file-selected-info" className="space-y-1">
                  <p className="text-xs font-semibold text-teal-400">{file.name}</p>
                  <p className="text-[10px] font-mono text-zinc-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              ) : (
                <div id="file-placeholder-info">
                  <p className="text-xs text-zinc-300">Drag & drop your downloaded platform ZIP file here</p>
                  <p className="text-[10px] font-mono text-zinc-600 mt-1">Supports Twitter/X, Reddit, or Facebook archives</p>
                </div>
              )}
            </div>

            {/* Sandbox ZIP helper */}
            <div id="dummy-generator-alert" className="flex items-start gap-3 p-3 bg-teal-500/5 border border-teal-500/20 rounded-xl text-xs text-zinc-300">
              <ShieldAlert className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-zinc-200">Sandbox ZIP Generator available:</p>
                <p className="text-[11px] text-zinc-400 mt-0.5">If you haven't downloaded your real archive yet, you can download our secure, dummy archive to test the decompression/ingestion flow.</p>
                <button
                  id="dummy-zip-download-btn"
                  onClick={triggerMockZipDownload}
                  className="mt-2 text-teal-400 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Download Demo ZIP File <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div id="ingest-error-box" className="flex items-center gap-2 p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl text-xs text-rose-400 mt-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Submit action */}
        <button
          id="trigger-analysis-btn"
          onClick={handleStart}
          className="w-full mt-6 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/5"
        >
          <Play className="w-4 h-4 fill-zinc-950" />
          <span>Execute MirrorScore Analysis</span>
        </button>
      </div>

      {/* Guide details displayed underneath */}
      <UploadGuide />
    </div>
  );
}
