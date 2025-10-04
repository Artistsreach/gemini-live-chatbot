import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, createUserContent, createPartFromUri } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const { fileUri, mimeType, userPrompt } = req.body;

    if (!fileUri || !mimeType) {
      return res.status(400).json({ error: 'fileUri and mimeType required' });
    }

    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

    // Use generateContent (not Live API) to analyze the audio file
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: createUserContent([
        createPartFromUri(fileUri, mimeType),
        userPrompt || `Analyze this music track in detail. Provide:

**Production Quality:**
- Overall sound quality and professional level
- Mixing balance (vocals, instruments, effects)
- Mastering and loudness
- Stereo imaging and spatial characteristics

**Musical Elements:**
- Genre and style
- Instrumentation and arrangement
- Melody, harmony, and rhythm
- Song structure and pacing

**Strengths:**
- What's working well
- Notable creative choices
- Professional techniques used

**Areas for Improvement:**
- Specific technical issues (EQ, compression, reverb, etc.)
- Arrangement or composition suggestions
- Production techniques to try

**Actionable Recommendations:**
- Concrete steps to improve the track
- Tools or techniques to use
- Industry-standard practices to apply

Be constructive, specific, and encouraging. Provide feedback that helps the artist grow.`
      ]),
      config: {
        thinkingConfig: {
          thinkingBudget: 0 // Disable thinking for faster response
        }
      }
    });

    const analysis = response.text;

    res.status(200).json({ analysis });

  } catch (error: any) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message || 'Analysis failed' });
  }
}
