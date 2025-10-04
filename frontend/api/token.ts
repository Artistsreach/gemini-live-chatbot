import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI, Modality, Type } from '@google/genai';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    const { mode = 'text' } = req.body;
    
    const client = new GoogleGenAI({ 
      apiKey: GEMINI_API_KEY,
      httpOptions: { apiVersion: 'v1alpha' }
    });
    
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    const responseModality = mode === 'audio' ? [Modality.AUDIO] : [Modality.TEXT];
    
    // System instruction
    const systemInstruction = `You are Migo, a music business expert who helps artists distribute and promote their music, as well as connect them to resources.

Your expertise includes:
- Music distribution strategies (Spotify, Apple Music, YouTube, etc.)
- Music promotion and marketing
- Social media strategies for musicians
- Building fan engagement
- Music industry resources and contacts
- Rights management and licensing
- Analytics and data insights for artists
- Monetization strategies

You have access to web scraping tools (scrape, crawl, search) and a knowledge base that allow you to:
- Research current music industry trends
- Find information about distribution platforms
- Discover promotional opportunities
- Gather data about music marketing strategies
- Find resources and contacts for artists
- Search internal knowledge for stored information

Be friendly, supportive, and practical in your advice. Help artists navigate the complex music industry with clear, actionable guidance.`;

    // Tool declarations with proper typing
    const tools = [
      {
        functionDeclarations: [
          {
            name: 'scrape_url',
            description: 'Scrapes a single URL and returns its content in markdown format.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                url: { type: Type.STRING, description: 'The URL to scrape' },
                formats: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['url']
            }
          },
          {
            name: 'crawl_website',
            description: 'Crawls an entire website and returns content from all accessible pages.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                url: { type: Type.STRING, description: 'The base URL to crawl' },
                limit: { type: Type.NUMBER, description: 'Maximum number of pages to crawl' }
              },
              required: ['url']
            }
          },
          {
            name: 'search_web',
            description: 'Searches the web and returns relevant results.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                query: { type: Type.STRING, description: 'The search query' },
                limit: { type: Type.NUMBER, description: 'Maximum number of results' }
              },
              required: ['query']
            }
          },
          {
            name: 'fetch_knowledge',
            description: 'Fetch entries from the knowledge base. Optionally filter by exact title.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'Exact title to fetch (optional)' },
                limit: { type: Type.NUMBER, description: 'Maximum rows to return' }
              }
            }
          },
          {
            name: 'search_knowledge',
            description: 'Search across title and note in the knowledge base.',
            parameters: {
              type: Type.OBJECT,
              properties: {
                query: { type: Type.STRING, description: 'Search term' },
                limit: { type: Type.NUMBER, description: 'Maximum rows' }
              },
              required: ['query']
            }
          }
        ]
      }
    ];

    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime,
        newSessionExpireTime,
        liveConnectConstraints: {
          model: 'gemini-live-2.5-flash-preview',
          config: {
            sessionResumption: {},
            responseModalities: responseModality,
            systemInstruction,
            tools
          }
        },
        httpOptions: { apiVersion: 'v1alpha' }
      }
    });
    
    res.status(200).json({
      token: token.name,
      model: 'gemini-live-2.5-flash-preview',
      mode
    });
    
  } catch (error: any) {
    console.error('Token creation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
