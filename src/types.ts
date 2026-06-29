/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlatformType = 'x' | 'facebook' | 'linkedin' | 'reddit' | 'instagram';

export interface DimensionScore {
  score: number;
  confidence: number;
  insufficient_data: boolean;
  analyst_note: string;
}

export interface DomainScores {
  emotional_intelligence: {
    status: 'complete' | 'failed' | 'insufficient_data';
    domain_score: number | null;
    confidence_avg: number | null;
    dimensions: {
      self_awareness_expression: DimensionScore;
      emotional_regulation_in_text: DimensionScore;
      empathetic_language: DimensionScore;
      emotional_vocabulary_range: DimensionScore;
    };
  };
  conflict_resolution: {
    status: 'complete' | 'failed' | 'insufficient_data';
    domain_score: number | null;
    confidence_avg: number | null;
    dimensions: {
      de_escalation_tendency: DimensionScore;
      response_proportionality: DimensionScore;
      resolution_seeking: DimensionScore;
      constructive_disagreement_capacity: DimensionScore;
    };
  };
  consistency_integrity: {
    status: 'complete' | 'failed' | 'insufficient_data';
    domain_score: number | null;
    confidence_avg: number | null;
    dimensions: {
      value_behavior_alignment: DimensionScore;
      temporal_consistency: DimensionScore;
      accountability_pattern: DimensionScore;
    };
  };
  empathy_others_orientation: {
    status: 'complete' | 'failed' | 'insufficient_data';
    domain_score: number | null;
    confidence_avg: number | null;
    dimensions: {
      generosity_of_interpretation: DimensionScore;
      expressed_care_for_others: DimensionScore;
      absent_others_dignity: DimensionScore;
      recognition_of_contributions: DimensionScore;
    };
  };
  growth_adaptability: {
    status: 'complete' | 'failed' | 'insufficient_data';
    domain_score: number | null;
    confidence_avg: number | null;
    dimensions: {
      explicit_acknowledgment_of_growth: DimensionScore;
      demonstrated_behavioral_change: DimensionScore;
      intellectual_curiosity: DimensionScore;
      resilience_narrative: DimensionScore;
    };
  };
  communication_quality: {
    status: 'complete' | 'failed' | 'insufficient_data';
    domain_score: number | null;
    confidence_avg: number | null;
    dimensions: {
      clarity_of_expression: DimensionScore;
      active_listening_signals: DimensionScore;
      tone_appropriateness: DimensionScore;
      directness_vs_passive_aggression: DimensionScore;
    };
  };
}

export type TierType = 'flourishing' | 'growing' | 'developing' | 'emerging' | 'formative';

export interface GrowthMission {
  mission_id: string;
  title: string;
  target_dimension: string;
  score_at_assignment: number;
  description: string;
  why_this_matters: string;
  specific_examples: string[];
  success_indicator: string;
  status: 'active' | 'completed' | 'skipped' | 'superseded';
  started_at: string;
  completed_at: string | null;
}

export interface ScanResult {
  id: string;
  scan_number: number;
  created_at: string;
  platforms_analyzed: PlatformType[];
  content_items_analyzed: number;
  data_date_range_start: string;
  data_date_range_end: string;
  is_delta_scan: boolean;
  chain_results: DomainScores;
  synthesis: {
    overall_mirrorscore: number;
    overall_tier: TierType;
    strength_highlights: string[];
    growth_opportunities: string[];
    narrative_summary: string;
  };
  growth_missions: GrowthMission[];
  previous_scan_id: string | null;
  score_deltas: {
    overall: number | null;
    emotional_intelligence: number | null;
    conflict_resolution: number | null;
    consistency_integrity: number | null;
    empathy_others_orientation: number | null;
    growth_adaptability: number | null;
    communication_quality: number | null;
  };
}

export interface PublicProfileConfig {
  slug: string;
  visibility: 'public' | 'link_only' | 'private';
  display_config: {
    show_overall_tier: boolean;
    show_domain_tiers: {
      emotional_intelligence: boolean;
      conflict_resolution: boolean;
      consistency_integrity: boolean;
      empathy_others_orientation: boolean;
      growth_adaptability: boolean;
      communication_quality: boolean;
    };
    show_growth_trajectory: boolean;
    show_active_mission_count: boolean;
    commitment_statement: string;
  };
}

export interface UserState {
  username: string;
  consent_accepted: boolean;
  consent_version: string;
  consent_accepted_at: string;
  scans: ScanResult[];
  public_profile: PublicProfileConfig;
}
