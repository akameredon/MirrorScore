/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Twitter, Layout, ShieldAlert, Linkedin, Download, AlertTriangle, ArrowRight } from 'lucide-react';

export default function UploadGuide() {
  const [activeTab, setActiveTab] = useState<'x' | 'facebook' | 'linkedin' | 'reddit'>('x');

  return (
    <div id="upload-guide-container" className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
      <div id="guide-header" className="flex items-start gap-3 mb-6">
        <Download id="guide-download-icon" className="w-5 h-5 text-teal-400 mt-0.5" />
        <div>
          <h3 id="guide-heading" className="text-base font-semibold text-white">How to Get Your Platform Archives</h3>
          <p id="guide-subheading" className="text-xs text-zinc-400">All data processing is compliant with GDPR Article 20 data portability laws.</p>
        </div>
      </div>

      {/* Tabs */}
      <div id="guide-tabs" className="flex gap-1.5 border-b border-zinc-800 pb-3 mb-4 overflow-x-auto">
        {(['x', 'facebook', 'linkedin', 'reddit'] as const).map((tab) => (
          <button
            key={tab}
            id={`tab-btn-${tab}`}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-xs font-mono rounded-lg border transition-all cursor-pointer ${
              activeTab === tab
                ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Steps Content */}
      <div id="guide-content" className="space-y-4">
        {activeTab === 'x' && (
          <div id="guide-content-x" className="space-y-2 text-xs text-zinc-300">
            <p className="font-semibold text-zinc-200">Steps to request your X/Twitter Archive:</p>
            <ol className="list-decimal list-inside space-y-1.5 font-sans leading-relaxed text-zinc-400">
              <li>Log in to your X/Twitter account and click the <strong className="text-zinc-300">More</strong> icon.</li>
              <li>Navigate to <strong className="text-zinc-300">Settings and privacy</strong> → <strong className="text-zinc-300">Your account</strong>.</li>
              <li>Click <strong className="text-zinc-300">Download an archive of your data</strong>.</li>
              <li>Verify your identity via password, email, or SMS verification.</li>
              <li>Click <strong className="text-zinc-300">Request archive</strong> (typically takes minutes to hours).</li>
            </ol>
            <div className="bg-zinc-950 p-2.5 rounded-lg border border-zinc-800/60 mt-3 text-[11px] text-zinc-500">
              <strong className="text-zinc-400">Security Note:</strong> Only your public tweets and replies are processed. Private messages (DMs) are fully stripped during ingestion.
            </div>
          </div>
        )}

        {activeTab === 'facebook' && (
          <div id="guide-content-facebook" className="space-y-2 text-xs text-zinc-300">
            <p className="font-semibold text-zinc-200">Steps to request your Facebook Profile Archive:</p>
            <ol className="list-decimal list-inside space-y-1.5 font-sans leading-relaxed text-zinc-400">
              <li>Go to your settings and select <strong className="text-zinc-300">Your Facebook Information</strong>.</li>
              <li>Click <strong className="text-zinc-300">Download Your Information</strong>.</li>
              <li>Set format to <strong className="text-zinc-300">JSON</strong> (HTML archives are unsupported).</li>
              <li>Select only <strong className="text-zinc-300">Posts</strong> and <strong className="text-zinc-300">Comments</strong> to speed up creation.</li>
              <li>Click <strong className="text-zinc-300">Request download</strong>.</li>
            </ol>
          </div>
        )}

        {activeTab === 'linkedin' && (
          <div id="guide-content-linkedin" className="space-y-2 text-xs text-zinc-300">
            <p className="font-semibold text-zinc-200">Steps to request your LinkedIn Profile Archive:</p>
            <ol className="list-decimal list-inside space-y-1.5 font-sans leading-relaxed text-zinc-400">
              <li>Click your profile picture in the top navigation bar and select <strong className="text-zinc-300">Settings & Privacy</strong>.</li>
              <li>Go to <strong className="text-zinc-300">Data privacy</strong> on the left panel.</li>
              <li>Under "How LinkedIn uses your data", click <strong className="text-zinc-300">Get a copy of your data</strong>.</li>
              <li>Select <strong className="text-zinc-300">Select specific data files</strong> and check <strong className="text-zinc-300">Articles</strong> and <strong className="text-zinc-300">Comments</strong>.</li>
              <li>Request the archive. LinkedIn typically generates this in 10 minutes.</li>
            </ol>
          </div>
        )}

        {activeTab === 'reddit' && (
          <div id="guide-content-reddit" className="space-y-2 text-xs text-zinc-300">
            <p className="font-semibold text-zinc-200">Steps to request your Reddit Archive:</p>
            <ol className="list-decimal list-inside space-y-1.5 font-sans leading-relaxed text-zinc-400">
              <li>Visit <strong className="text-zinc-300">reddit.com/settings/data-request</strong> in your browser.</li>
              <li>Specify that you are requesting a data export of your posts, comments, and profile history.</li>
              <li>Click submit. Reddit sends a download link to your registered email address.</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
