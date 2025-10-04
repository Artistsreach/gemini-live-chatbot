import type { VercelRequest, VercelResponse } from '@vercel/node';

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
    
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    const responseModality = mode === 'audio' ? ['AUDIO'] : ['TEXT'];
    
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

    // Tool declarations
    const tools = [
      {
        functionDeclarations: [
          {
            name: 'scrape_url',
            description: 'Scrapes a single URL and returns its content in markdown format.',
            parameters: {
              type: 'object',
              properties: {
                url: { type: 'string', description: 'The URL to scrape' },
                formats: { type: 'array', items: { type: 'string' }, default: ['markdown'] }
              },
              required: ['url']
            }
          },
          {
            name: 'crawl_website',
            description: 'Crawls an entire website and returns content from all accessible pages.',
            parameters: {
              type: 'object',
              properties: {
                url: { type: 'string', description: 'The base URL to crawl' },
                limit: { type: 'number', description: 'Maximum number of pages to crawl', default: 10 }
              },
              required: ['url']
            }
          },
          {
            name: 'search_web',
            description: 'Searches the web and returns relevant results.',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'The search query' },
                limit: { type: 'number', description: 'Maximum number of results', default: 5 }
              },
              required: ['query']
            }
          },
          {
            name: 'fetch_knowledge',
            description: 'Fetch entries from the knowledge base. Optionally filter by exact title.',
            parameters: {
              type: 'object',
              properties: {
                title: { type: 'string', description: 'Exact title to fetch (optional)' },
                limit: { type: 'number', description: 'Maximum rows to return', default: 10 }
              }
            }
          },
          {
            name: 'search_knowledge',
            description: 'Search across title and note in the knowledge base.',
            parameters: {
              type: 'object',
              properties: {
                query: { type: 'string', description: 'Search term' },
                limit: { type: 'number', description: 'Maximum rows', default: 10 }
              },
              required: ['query']
            }
          }
        ]
      }
    ];

    const response = await fetch('https://generativelanguage.googleapis.com/v1alpha/authTokens', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        config: {
          uses: 1,
          expireTime,
          newSessionExpireTime,
          liveConnectConstraints: {
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            config: {
              sessionResumption: {},
              responseModalities: responseModality,
              systemInstruction: { parts: [{ text: systemInstruction }] },
              tools,
              inputAudioTranscription: {},
              outputAudioTranscription: mode === 'audio' ? {} : undefined
            }
          }
        }
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      return res.status(response.status).json({ error: 'Failed to create token' });
    }

    const data = await response.json();
    
    res.status(200).json({
      token: data.name,
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      mode
    });
    
  } catch (error: any) {
    console.error('Token creation error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
