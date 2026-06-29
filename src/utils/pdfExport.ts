/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { jsPDF } from 'jspdf';
import { ScanResult, PublicProfileConfig } from '../types';

export function exportScanToPDF(scan: ScanResult, username: string, profileConfig?: PublicProfileConfig) {
  // Create instance of jsPDF (A4 size, units in mm)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2; // 180mm
  
  let y = margin;

  // Helper functions for PDF styling
  const addHeader = (title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.setTextColor(20, 184, 166); // Teal
    doc.text(title, margin, y);
    y += 8;
  };

  const addDivider = (color = [228, 228, 231]) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 6;
  };

  const addSectionTitle = (title: string) => {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(39, 39, 42); // zinc-800
    doc.text(title, margin, y);
    y += 5;
  };

  const checkPageOverflow = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin) {
      doc.addPage();
      y = margin;
      // Small header on new page
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(161, 161, 170); // zinc-400
      doc.text(`MirrorScore Communication Audit Report — @${username.toLowerCase()}`, margin, y);
      y += 5;
      addDivider([244, 244, 245]);
    }
  };

  // --- PAGE 1: COVER & OVERVIEW ---
  
  // Decorative Badge Background / Accents
  doc.setFillColor(244, 244, 245); // Zinc-100
  doc.rect(0, 0, pageWidth, 12, 'F');
  
  y = 22;
  addHeader('MIRRORSCORE');
  
  // Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.setTextColor(63, 63, 70); // zinc-700
  doc.text('Relational Communication Audit Report', margin, y);
  y += 6;

  // Metadata Block
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(113, 113, 122); // zinc-500
  const dateStr = new Date(scan.created_at).toLocaleString();
  doc.text(`AUDIT ID: MS-${scan.scan_number}-${Math.floor(Math.random() * 10000)}`, margin, y);
  doc.text(`DATE: ${dateStr}`, margin + 80, y);
  y += 5;
  doc.text(`AUDIT TARGET: @${username.toLowerCase()}`, margin, y);
  doc.text(`PLATFORMS AUDITED: ${scan.platforms_analyzed.join(', ').toUpperCase()}`, margin + 80, y);
  y += 8;

  addDivider([20, 184, 166]); // Teal divider

  // Score Highlight Card
  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y, contentWidth, 32, 4, 4, 'FD');

  const overallScore = scan.synthesis.overall_mirrorscore.toFixed(1);
  const overallTier = scan.synthesis.overall_tier.toUpperCase();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  doc.setTextColor(13, 148, 136); // Teal-600
  doc.text(overallScore, margin + 8, y + 20);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  doc.text('/ 10.0', margin + 28, y + 20);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(39, 39, 42);
  doc.text(`TIER: ${overallTier}`, margin + 50, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(82, 82, 91);
  doc.text(`Analysis compiled from ${scan.content_items_analyzed} unique communicative ingestion elements.`, margin + 50, y + 20);
  doc.text(`State: Verified Client-Only Decentralized Scan.`, margin + 50, y + 25);

  y += 40;

  // Growth Commitment (If exists)
  const commitment = profileConfig?.display_config?.commitment_statement;
  if (commitment) {
    doc.setFillColor(240, 253, 250); // Teal-50
    doc.setDrawColor(204, 251, 241); // Teal-100
    doc.roundedRect(margin, y, contentWidth, 22, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 118, 110); // Teal-700
    doc.text('PERSONAL RELATIONALLY COMMITTED GOAL', margin + 5, y + 6);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(9);
    doc.setTextColor(39, 39, 42);
    const splitCommitment = doc.splitTextToSize(`"${commitment}"`, contentWidth - 10);
    doc.text(splitCommitment, margin + 5, y + 12);

    y += 28;
  }

  // Narrative Summary
  addSectionTitle('BEHAVIORAL INGESTION NARRATIVE');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(63, 63, 70); // Zinc-700
  
  const splitNarrative = doc.splitTextToSize(scan.synthesis.narrative_summary, contentWidth);
  doc.text(splitNarrative, margin, y);
  
  // Calculate narrative height
  const linesCount = splitNarrative.length;
  y += (linesCount * 4.5) + 6;

  // Strengths & Opportunities (Side by Side)
  checkPageOverflow(65);
  
  const halfWidth = contentWidth / 2 - 4;
  
  // Strengths Column
  let startColY = y;
  doc.setFillColor(240, 253, 244); // Green-50
  doc.setDrawColor(220, 252, 231); // Green-100
  doc.roundedRect(margin, y, halfWidth, 54, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(21, 128, 61); // Green-700
  doc.text('VERIFIED STRENGTHS', margin + 5, y + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(24, 24, 27);
  let strengthY = y + 13;
  scan.synthesis.strength_highlights.forEach((h) => {
    const splitH = doc.splitTextToSize(`• ${h}`, halfWidth - 10);
    doc.text(splitH, margin + 5, strengthY);
    strengthY += (splitH.length * 4);
  });

  // Opportunities Column
  doc.setFillColor(240, 253, 250); // Teal-50
  doc.setDrawColor(204, 251, 241); // Teal-100
  doc.roundedRect(margin + halfWidth + 8, y, halfWidth, 54, 3, 3, 'FD');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 118, 110); // Teal-700
  doc.text('GROWTH OPPORTUNITIES', margin + halfWidth + 13, y + 6);
  
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(24, 24, 27);
  let opportunityY = y + 13;
  scan.synthesis.growth_opportunities.forEach((o) => {
    const splitO = doc.splitTextToSize(`• ${o}`, halfWidth - 10);
    doc.text(splitO, margin + halfWidth + 13, opportunityY);
    opportunityY += (splitO.length * 4);
  });

  y = Math.max(strengthY, opportunityY) + 8;

  // --- PAGE 2: DEEP DOMAIN RESULTS ---
  checkPageOverflow(40);
  addDivider();
  addSectionTitle('6 ANALYZED COMMUNICATION DOMAINS');
  y += 2;

  const domains = [
    { key: 'emotional_intelligence', label: 'Emotional Intelligence (EQ)' },
    { key: 'conflict_resolution', label: 'Conflict Style' },
    { key: 'consistency_integrity', label: 'Consistency & Integrity' },
    { key: 'empathy_others_orientation', label: 'Empathy & Others-Orientation' },
    { key: 'growth_adaptability', label: 'Growth & Adaptability' },
    { key: 'communication_quality', label: 'Communication Quality' },
  ];

  domains.forEach((dom) => {
    const domData = (scan.chain_results as any)[dom.key];
    if (!domData) return;

    checkPageOverflow(45);

    doc.setFillColor(252, 252, 253);
    doc.setDrawColor(244, 244, 245);
    doc.roundedRect(margin, y, contentWidth, 38, 2, 2, 'FD');

    // Title & Score
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(24, 24, 27);
    doc.text(dom.label, margin + 4, y + 6);

    const score = domData.domain_score || 0;
    const tier = score >= 8.5 ? 'FLOURISHING' : score >= 7.0 ? 'GROWING' : score >= 5.5 ? 'DEVELOPING' : score >= 4.0 ? 'EMERGING' : 'FORMATIVE';

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(13, 148, 136); // Teal
    doc.text(`${score.toFixed(1)} / 10`, margin + contentWidth - 30, y + 6);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122);
    doc.text(`[${tier}]`, margin + contentWidth - 55, y + 5.5);

    // Render dimensions
    let dimY = y + 13;
    if (domData.dimensions) {
      Object.entries(domData.dimensions).slice(0, 2).forEach(([subKey, val]: [string, any]) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(63, 63, 70);
        doc.text(`${subKey.replace(/_/g, ' ').toUpperCase()}`, margin + 6, dimY);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(13, 148, 136);
        doc.text(`${val.score.toFixed(1)}`, margin + contentWidth - 15, dimY);

        doc.setFont('helvetica', 'italic');
        doc.setFontSize(8);
        doc.setTextColor(113, 113, 122);
        const splitNote = doc.splitTextToSize(`"${val.analyst_note}"`, contentWidth - 40);
        doc.text(splitNote, margin + 6, dimY + 4);

        dimY += 11;
      });
    }

    y += 42;
  });

  // Footer / Disclaimer Page 2
  checkPageOverflow(25);
  addDivider();
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(161, 161, 170); // Zinc-400
  const splitDisclaimer = doc.splitTextToSize(
    'SYSTEM DISCLAIMER: MirrorScore evaluates self-submitted and public communications archives using automated client-directed linguistic and semantic analysis algorithms. This is not a clinical assessment, diagnostic aid, psychological validation, or professional psychiatric evaluation. Participation is entirely self-directed and voluntary.',
    contentWidth
  );
  doc.text(splitDisclaimer, margin, y);
  y += 12;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(82, 82, 91);
  doc.text('© MirrorScore.app — Decentralized Relational Health', margin, y);

  // Trigger download
  const safeUsername = username.toLowerCase().replace(/[^a-z0-9]/g, '_');
  doc.save(`mirrorscore_audit_${safeUsername}_scan_${scan.scan_number}.pdf`);
}
