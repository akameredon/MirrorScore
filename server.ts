/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY environment variable is required. Please set it in Settings > Secrets.');
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

async function generateContentWithRetryAndFallback(
  client: GoogleGenAI,
  params: {
    contents: any;
    config: any;
  }
) {
  const primaryModel = 'gemini-3.5-flash';
  const fallbackModel = 'gemini-3.1-flash-lite';
  const maxRetries = 2;
  
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      console.log(`Calling Gemini API with model: ${primaryModel} (Attempt ${attempt}/${maxRetries + 1})`);
      const response = await client.models.generateContent({
        model: primaryModel,
        contents: params.contents,
        config: params.config,
      });
      return response;
    } catch (err: any) {
      const errMsg = err.message || '';
      const isUnavailable = errMsg.includes('503') || 
                            errMsg.includes('UNAVAILABLE') || 
                            errMsg.includes('high demand') ||
                            errMsg.includes('overloaded') ||
                            err.status === 503;
                            
      console.warn(`Attempt ${attempt} failed with error:`, errMsg);
      
      if (attempt <= maxRetries && isUnavailable) {
        const delay = attempt * 1500;
        console.log(`Waiting ${delay}ms before retrying...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      console.log(`Primary model failed or exhausted. Switching to fallback model: ${fallbackModel}`);
      break;
    }
  }

  try {
    console.log(`Calling Gemini API with fallback model: ${fallbackModel}`);
    const response = await client.models.generateContent({
      model: fallbackModel,
      contents: params.contents,
      config: params.config,
    });
    return response;
  } catch (fallbackErr: any) {
    console.error(`Fallback model ${fallbackModel} also failed:`, fallbackErr);
    throw fallbackErr;
  }
}

// REST endpoint for analyzing user digital footprint
app.post('/api/analyze', async (req, res) => {
  try {
    const { text, platforms, username, demoType } = req.body;

    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Valid content text is required for analysis.' });
      return;
    }

    const client = getGeminiClient();

    // Prepare system instruction for highly specific MirrorScore analysis
    const systemInstruction = `You are MirrorScore's Principal Behavioral Analytics AI. Your task is to perform an objective, evidence-based, professional communication analysis on a digital footprint text corpus.
This analysis is NOT a clinical diagnosis or psychological evaluation. It assesses observable communication behaviors, conflict resolution patterns, emotional regulation, consistency, and growth over time in text.

You MUST analyze the text under these 6 specific domains:
1. EMOTIONAL_INTELLIGENCE (EQ):
   - self_awareness_expression: Acknowledging mistakes, personal limits, or self-reflection.
   - emotional_regulation_in_text: Responding proportionately vs escalating or overreacting under tension.
   - empathetic_language: Showing consideration for others' circumstances or viewpoints.
   - emotional_vocabulary_range: Using a rich vocabulary to describe feelings vs binary expressions.

2. CONFLICT_RESOLUTION:
   - de_escalation_tendency: Reducing heat, finding common ground, defusing vs escalating.
   - response_proportionality: Responding with balanced intensity to challenge or provocation.
   - resolution_seeking: Moving conversations toward resolution or constructive exit vs leaving raw hostility.
   - constructive_disagreement_capacity: Disagreeing with arguments firmly and respectfully without personal attacks.

3. CONSISTENCY_INTEGRITY:
   - value_behavior_alignment: Aligning self-stated values with actual behaviors in interactions.
   - temporal_consistency: Expressing stable positive principles over time while being open to healthy learning.
   - accountability_pattern: Direct, non-deflective accountability when challenged on facts or tone.

4. EMPATHY_OTHERS_ORIENTATION:
   - generosity_of_interpretation: Assuming positive/reasonable intent in others.
   - expressed_care_for_others: Authentic, context-specific encouragement and support.
   - absent_others_dignity: Speaking of ex-partners, old friends, or absent people with basic respect.
   - recognition_of_contributions: Giving credit to others instead of centering self entirely.

5. GROWTH_ADAPTABILITY:
   - explicit_acknowledgment_of_growth: Verbally stating personal learning or lessons from past mistakes.
   - demonstrated_behavioral_change: Longitudinal improvement in tone, regulation, or conflict resolution in newer text.
   - intellectual_curiosity: Seeking new ideas, asking open questions, showing curiosity.
   - resilience_narrative: Framing hard times with forward-looking lessons and adaptation.

6. COMMUNICATION_QUALITY:
   - clarity_of_expression: Expressing ideas directly, understandably, without excessive hedging.
   - active_listening_signals: Incorporating or acknowledging what others said instead of talking past them.
   - tone_appropriateness: Calibrating seriousness, humor, or professional tone correctly to the situation.
   - directness_vs_passive_aggression: Direct expression vs sarcasm, snark, backhanded remarks, or hinting.

Based on your analysis, construct a fully detailed JSON response. Include:
- A derived "overall_mirrorscore" (1.0 to 10.0), calculated as a weighted average:
  EQ (20%), Conflict Style (20%), Consistency/Integrity (18%), Empathy (18%), Growth (14%), Communication Quality (10%).
- An "overall_tier" based on the score:
  * 8.5–10.0: flourishing
  * 7.0–8.4: growing
  * 5.5–6.9: developing
  * 4.0–5.4: emerging
  * 1.0–3.9: formative
- 3 specific, evidence-backed "strength_highlights".
- 3 specific, constructive "growth_opportunities" (not worded as flaws, but as areas of growth).
- An insightful, professional "narrative_summary" (2-3 paragraphs) explaining their behavioral posture, communication style, and growth journey based on the evidence.
- The 6 detailed domains containing each of their sub-dimensions. Each sub-dimension MUST contain:
  * "score": a float from 1.0 to 10.0.
  * "confidence": a float from 0.0 to 1.0 representing analysis reliability.
  * "insufficient_data": boolean.
  * "analyst_note": a detailed, highly specific sentence citing text evidence or patterns (e.g., "The text contains multiple instances in 2024 where the user apologized or acknowledged a misunderstanding").
- Exactly 3 custom, highly actionable "growth_missions" (coaching plan) targeting their lower-scoring dimensions. Each mission MUST contain:
  * "mission_id": a unique string (e.g., "mission_eq_1").
  * "title": an engaging, specific title.
  * "target_dimension": string (dot-notation, e.g., "conflict_resolution.constructive_disagreement_capacity" or "emotional_intelligence.emotional_regulation_in_text").
  * "score_at_assignment": the score of that sub-dimension.
  * "description": a highly practical behavioral instruction for what to do in the next 30 days.
  * "why_this_matters": a scientific or relational justification.
  * "specific_examples": an array of 2-3 specific "instead of X, try Y" concrete templates.
  * "success_indicator": a measurable benchmark for self-assessment.

Do NOT diagnose. Frame everything with warm, non-judgmental, objective, professional development language. Return ONLY JSON.`;

    const prompt = `Analyze the following digital footprint communication corpus for the user "${username || 'Participant'}" (platforms parsed: ${platforms?.join(', ') || 'unknown'}).
Text Corpus:
"""
${text}
"""

Return the output strictly in valid JSON format.`;

    const response = await generateContentWithRetryAndFallback(client, {
      contents: prompt,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          required: ['overall_mirrorscore', 'overall_tier', 'strength_highlights', 'growth_opportunities', 'narrative_summary', 'chain_results', 'growth_missions'],
          properties: {
            overall_mirrorscore: { type: Type.NUMBER },
            overall_tier: { type: Type.STRING },
            strength_highlights: { type: Type.ARRAY, items: { type: Type.STRING } },
            growth_opportunities: { type: Type.ARRAY, items: { type: Type.STRING } },
            narrative_summary: { type: Type.STRING },
            chain_results: {
              type: Type.OBJECT,
              required: ['emotional_intelligence', 'conflict_resolution', 'consistency_integrity', 'empathy_others_orientation', 'growth_adaptability', 'communication_quality'],
              properties: {
                emotional_intelligence: {
                  type: Type.OBJECT,
                  required: ['status', 'domain_score', 'confidence_avg', 'dimensions'],
                  properties: {
                    status: { type: Type.STRING },
                    domain_score: { type: Type.NUMBER },
                    confidence_avg: { type: Type.NUMBER },
                    dimensions: {
                      type: Type.OBJECT,
                      required: ['self_awareness_expression', 'emotional_regulation_in_text', 'empathetic_language', 'emotional_vocabulary_range'],
                      properties: {
                        self_awareness_expression: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        emotional_regulation_in_text: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        empathetic_language: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        emotional_vocabulary_range: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        }
                      }
                    }
                  }
                },
                conflict_resolution: {
                  type: Type.OBJECT,
                  required: ['status', 'domain_score', 'confidence_avg', 'dimensions'],
                  properties: {
                    status: { type: Type.STRING },
                    domain_score: { type: Type.NUMBER },
                    confidence_avg: { type: Type.NUMBER },
                    dimensions: {
                      type: Type.OBJECT,
                      required: ['de_escalation_tendency', 'response_proportionality', 'resolution_seeking', 'constructive_disagreement_capacity'],
                      properties: {
                        de_escalation_tendency: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        response_proportionality: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        resolution_seeking: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        constructive_disagreement_capacity: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        }
                      }
                    }
                  }
                },
                consistency_integrity: {
                  type: Type.OBJECT,
                  required: ['status', 'domain_score', 'confidence_avg', 'dimensions'],
                  properties: {
                    status: { type: Type.STRING },
                    domain_score: { type: Type.NUMBER },
                    confidence_avg: { type: Type.NUMBER },
                    dimensions: {
                      type: Type.OBJECT,
                      required: ['value_behavior_alignment', 'temporal_consistency', 'accountability_pattern'],
                      properties: {
                        value_behavior_alignment: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        temporal_consistency: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        accountability_pattern: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        }
                      }
                    }
                  }
                },
                empathy_others_orientation: {
                  type: Type.OBJECT,
                  required: ['status', 'domain_score', 'confidence_avg', 'dimensions'],
                  properties: {
                    status: { type: Type.STRING },
                    domain_score: { type: Type.NUMBER },
                    confidence_avg: { type: Type.NUMBER },
                    dimensions: {
                      type: Type.OBJECT,
                      required: ['generosity_of_interpretation', 'expressed_care_for_others', 'absent_others_dignity', 'recognition_of_contributions'],
                      properties: {
                        generosity_of_interpretation: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        expressed_care_for_others: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        absent_others_dignity: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        recognition_of_contributions: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        }
                      }
                    }
                  }
                },
                growth_adaptability: {
                  type: Type.OBJECT,
                  required: ['status', 'domain_score', 'confidence_avg', 'dimensions'],
                  properties: {
                    status: { type: Type.STRING },
                    domain_score: { type: Type.NUMBER },
                    confidence_avg: { type: Type.NUMBER },
                    dimensions: {
                      type: Type.OBJECT,
                      required: ['explicit_acknowledgment_of_growth', 'demonstrated_behavioral_change', 'intellectual_curiosity', 'resilience_narrative'],
                      properties: {
                        explicit_acknowledgment_of_growth: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        demonstrated_behavioral_change: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        intellectual_curiosity: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        resilience_narrative: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        }
                      }
                    }
                  }
                },
                communication_quality: {
                  type: Type.OBJECT,
                  required: ['status', 'domain_score', 'confidence_avg', 'dimensions'],
                  properties: {
                    status: { type: Type.STRING },
                    domain_score: { type: Type.NUMBER },
                    confidence_avg: { type: Type.NUMBER },
                    dimensions: {
                      type: Type.OBJECT,
                      required: ['clarity_of_expression', 'active_listening_signals', 'tone_appropriateness', 'directness_vs_passive_aggression'],
                      properties: {
                        clarity_of_expression: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        active_listening_signals: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        tone_appropriateness: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        },
                        directness_vs_passive_aggression: {
                          type: Type.OBJECT,
                          required: ['score', 'confidence', 'insufficient_data', 'analyst_note'],
                          properties: { score: { type: Type.NUMBER }, confidence: { type: Type.NUMBER }, insufficient_data: { type: Type.BOOLEAN }, analyst_note: { type: Type.STRING } }
                        }
                      }
                    }
                  }
                }
              }
            },
            growth_missions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ['mission_id', 'title', 'target_dimension', 'score_at_assignment', 'description', 'why_this_matters', 'specific_examples', 'success_indicator'],
                properties: {
                  mission_id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  target_dimension: { type: Type.STRING },
                  score_at_assignment: { type: Type.NUMBER },
                  description: { type: Type.STRING },
                  why_this_matters: { type: Type.STRING },
                  specific_examples: { type: Type.ARRAY, items: { type: Type.STRING } },
                  success_indicator: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const parsedData = JSON.parse(response.text || '{}');
    res.json(parsedData);
  } catch (err: any) {
    console.error('Analysis error:', err);
    res.status(500).json({ error: err.message || 'An internal error occurred during Gemini analysis.' });
  }
});

// Configure Vite integration and start listening
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MirrorScore backend server listening on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start MirrorScore server:', err);
});
