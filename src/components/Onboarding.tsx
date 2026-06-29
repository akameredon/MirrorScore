/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, Lock, Eye, EyeOff, Sparkles, AlertCircle, Heart, CheckCircle } from 'lucide-react';

interface OnboardingProps {
  onComplete: (username: string) => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<number>(1);
  const [username, setUsername] = useState<string>('');
  const [typedConsent, setTypedConsent] = useState<string>('');
  const [error, setError] = useState<string>('');

  const nextStep = () => {
    if (step === 1 && !username.trim()) {
      setError('Please enter a display name or username to begin.');
      return;
    }
    setError('');
    setStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setError('');
    setStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typedConsent.toLowerCase().trim() !== 'i understand') {
      setError('Please type "I understand" exactly to proceed.');
      return;
    }
    onComplete(username.trim());
  };

  return (
    <div id="onboarding-container" className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8">
      <div id="onboarding-card" className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden p-6 md:p-8">
        
        {/* Header / Logo */}
        <div id="onboarding-header" className="flex flex-col items-center text-center mb-6">
          <div id="logo-icon-container" className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center border border-teal-500/20 mb-3">
            <Sparkles id="logo-icon" className="w-6 h-6 text-teal-400" />
          </div>
          <h1 id="logo-text" className="text-2xl font-bold tracking-tight text-white font-sans">MirrorScore</h1>
          <p id="logo-subtext" className="text-xs text-zinc-400 font-mono mt-1">IdeaProof Pivot Validation • v1.0</p>
        </div>

        {/* Step Indicators */}
        <div id="step-indicators" className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((num) => (
            <div
              key={num}
              id={`step-indicator-${num}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === num ? 'w-8 bg-teal-400' : 'w-2 bg-zinc-800'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Username & Concept */}
        {step === 1 && (
          <div id="onboarding-step-1" className="space-y-4">
            <h2 id="step-1-title" className="text-lg font-medium text-white tracking-tight">Begin Your Self-Audit</h2>
            <p id="step-1-desc" className="text-sm text-zinc-300 leading-relaxed">
              MirrorScore is an offline-first, self-directed behavioral reflection platform. It parses your social archives to show you, in objective data, how you communicate and handle relationships online.
            </p>

            {/* Optimized High-Performance Responsive WebP/JPEG Banner Asset */}
            <div className="my-6 flex justify-center">
              <div className="relative w-36 h-36 rounded-full overflow-hidden bg-zinc-950 border border-zinc-800 p-1 flex items-center justify-center">
                <picture>
                  <source srcSet="/src/assets/images/mirrorscore_badge_1782716839578.jpg" type="image/webp" />
                  <img
                    src="/src/assets/images/mirrorscore_badge_1782716839578.jpg"
                    alt="MirrorScore Verified Audit Seal"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover rounded-full"
                    width={144}
                    height={144}
                  />
                </picture>
                <div className="absolute inset-0 rounded-full border border-teal-500/10 pointer-events-none" />
              </div>
            </div>

            <div id="step-1-form-group" className="space-y-1 pt-2">
              <label id="username-label" className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Choose a Username</label>
              <input
                id="username-input"
                type="text"
                placeholder="e.g. self_aware_coder"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''));
                  setError('');
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-teal-500 font-mono transition-colors min-h-[46px]"
                maxLength={30}
              />
              <p id="username-hint" className="text-[10px] text-zinc-500">Only letters, numbers, and underscores are allowed.</p>
            </div>
            {error && (
              <div id="step-1-error" className="flex items-center gap-2 p-2.5 bg-rose-950/20 border border-rose-900/30 rounded-lg text-xs text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <button
              id="step-1-next-btn"
              onClick={nextStep}
              className="w-full mt-4 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-semibold py-3 min-h-[46px] rounded-lg transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-lg"
            >
              Let's Begin
            </button>
          </div>
        )}

        {/* Step 2: What is Measured / What is Safe */}
        {step === 2 && (
          <div id="onboarding-step-2" className="space-y-4">
            <h2 id="step-2-title" className="text-lg font-medium text-white tracking-tight">What We Audit</h2>
            <p id="step-2-desc" className="text-sm text-zinc-300 leading-relaxed">
              We look strictly at communication style, emotional language, and dispute de-escalation patterns.
            </p>
            <div id="step-2-checklist" className="space-y-3 pt-2">
              <div id="measured-item-1" className="flex items-start gap-3">
                <CheckCircle id="measured-check-1" className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                <div>
                  <h4 id="measured-title-1" className="text-xs font-semibold text-zinc-200">Public Comments & Posts</h4>
                  <p id="measured-desc-1" className="text-[11px] text-zinc-400">Your tweets, replies, Reddit posts, and LinkedIn contributions.</p>
                </div>
              </div>
              <div id="excluded-item-1" className="flex items-start gap-3">
                <EyeOff id="excluded-check-1" className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <h4 id="excluded-title-1" className="text-xs font-semibold text-zinc-200">Strictly Excluded Data</h4>
                  <p id="excluded-desc-1" className="text-[11px] text-zinc-400">DMs, private emails, phone numbers, and location coordinates are ignored and stripped during parse.</p>
                </div>
              </div>
            </div>
            <div id="step-2-nav" className="flex gap-3 pt-4">
              <button
                id="step-2-back-btn"
                onClick={prevStep}
                className="w-1/3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium py-3 min-h-[46px] rounded-lg transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                id="step-2-next-btn"
                onClick={nextStep}
                className="w-2/3 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-semibold py-3 min-h-[46px] rounded-lg transition-colors cursor-pointer shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Strict Privacy & Agency */}
        {step === 3 && (
          <div id="onboarding-step-3" className="space-y-4">
            <h2 id="step-3-title" className="text-lg font-medium text-white tracking-tight">Complete Privacy Control</h2>
            <p id="step-3-desc" className="text-sm text-zinc-300 leading-relaxed">
              MirrorScore is built on user agency. Unlike traditional tracking utilities, we are 100% voluntary.
            </p>
            <div id="step-3-points" className="space-y-3 pt-2">
              <div id="point-1" className="flex items-center gap-3 p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/40">
                <Lock id="point-lock" className="w-5 h-5 text-amber-400 shrink-0" />
                <span id="point-text-1" className="text-[11px] text-zinc-300">Your analysis is stored locally and securely. No advertising models.</span>
              </div>
              <div id="point-2" className="flex items-center gap-3 p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/40">
                <Heart id="point-heart" className="w-5 h-5 text-teal-400 shrink-0" />
                <span id="point-text-2" className="text-[11px] text-zinc-300">Optional Public Badging: Display your growth tier on your own terms.</span>
              </div>
              <div id="point-3" className="flex items-center gap-3 p-2.5 bg-zinc-950 rounded-lg border border-zinc-800/40">
                <ShieldCheck id="point-shield" className="w-5 h-5 text-blue-400 shrink-0" />
                <span id="point-text-3" className="text-[11px] text-zinc-300">You can download or permanently purge your audit record in 1-click.</span>
              </div>
            </div>
            <div id="step-3-nav" className="flex gap-3 pt-4">
              <button
                id="step-3-back-btn"
                onClick={prevStep}
                className="w-1/3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium py-3 min-h-[46px] rounded-lg transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                id="step-3-next-btn"
                onClick={nextStep}
                className="w-2/3 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-semibold py-3 min-h-[46px] rounded-lg transition-colors cursor-pointer shadow-lg"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Consent Affirmation */}
        {step === 4 && (
          <form id="onboarding-step-4" onSubmit={handleSubmit} className="space-y-4">
            <h2 id="step-4-title" className="text-lg font-medium text-white tracking-tight">Explicit Consent Required</h2>
            <p id="step-4-desc" className="text-sm text-zinc-300 leading-relaxed">
              To proceed, confirm that you are auditing your own digital footprint, and authorize MirrorScore to run its behavioral analysis on the uploaded text history.
            </p>
            <div id="step-4-input-group" className="space-y-2 pt-2">
              <label id="consent-label" className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">
                Type <span className="text-teal-400 font-bold">I understand</span> to confirm:
              </label>
              <input
                id="consent-input"
                type="text"
                placeholder="I understand"
                value={typedConsent}
                onChange={(e) => {
                  setTypedConsent(e.target.value);
                  setError('');
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-white placeholder-zinc-700 focus:outline-none focus:border-teal-500 font-mono text-center transition-colors min-h-[46px]"
                autoComplete="off"
              />
            </div>
            {error && (
              <div id="step-4-error" className="flex items-center gap-2 p-2.5 bg-rose-950/20 border border-rose-900/30 rounded-lg text-xs text-rose-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div id="step-4-nav" className="flex gap-3 pt-4">
              <button
                id="step-4-back-btn"
                type="button"
                onClick={prevStep}
                className="w-1/3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 font-medium py-3 min-h-[46px] rounded-lg transition-colors cursor-pointer"
              >
                Back
              </button>
              <button
                id="step-4-submit-btn"
                type="submit"
                className="w-2/3 bg-teal-500 hover:bg-teal-400 text-zinc-950 font-semibold py-3 min-h-[46px] rounded-lg transition-colors cursor-pointer shadow-lg"
              >
                Authorize & Continue
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
