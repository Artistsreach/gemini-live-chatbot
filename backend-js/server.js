import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { WebSocketServer } from 'ws';
import { GoogleGenAI, Modality } from '@google/genai';
import http from 'http';
import Firecrawl from '@mendable/firecrawl-js';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws/chat' });

const PORT = process.env.PORT || 8000;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;

if (!GEMINI_API_KEY) {
  console.error('Error: GEMINI_API_KEY not found in environment variables');
  process.exit(1);
}

if (!FIRECRAWL_API_KEY) {
  console.warn('Warning: FIRECRAWL_API_KEY not found. Firecrawl tools will not be available.');
}

// Initialize Firecrawl client
const firecrawl = FIRECRAWL_API_KEY ? new Firecrawl({ apiKey: FIRECRAWL_API_KEY }) : null;

// Initialize Supabase client
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY)
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

// Migo's system instruction
const MIGO_SYSTEM_INSTRUCTION = `You are Migo, a music business expert who helps artists distribute and promote their music, as well as connect them to resources.

Your expertise includes:
- Music distribution strategies (Spotify, Apple Music, YouTube, etc.)
- Music promotion and marketing
- Social media strategies for musicians
- Building fan engagement
- Music industry resources and contacts
- Rights management and licensing
- Analytics and data insights for artists
- Monetization strategies

You have access to web scraping tools (scrape, crawl, search) that allow you to:
- Research current music industry trends
- Find information about distribution platforms
- Discover promotional opportunities
- Gather data about music marketing strategies
- Find resources and contacts for artists

Use these tools when users ask about:
- Current information about music platforms or services
- Latest industry news or trends
- Specific resources or websites
- Data that needs to be looked up online

Be friendly, supportive, and practical in your advice. Help artists navigate the complex music industry with clear, actionable guidance.`;

// Tool function declarations for Gemini
const toolDeclarations = [
  {
    functionDeclarations: [
      {
        name: 'scrape_url',
        description: 'Scrapes a single URL and returns its content in markdown format. Use this to extract information from a specific webpage about music industry resources, distribution platforms, or promotional opportunities.',
        parameters: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The URL to scrape'
            },
            formats: {
              type: 'array',
              items: { type: 'string' },
              description: 'Output formats to retrieve (e.g., ["markdown", "html"])',
              default: ['markdown']
            }
          },
          required: ['url']
        }
      },
      {
        name: 'crawl_website',
        description: 'Crawls an entire website and returns content from all accessible pages. Use this to gather comprehensive information about music platforms, industry resources, or promotional strategies across an entire site.',
        parameters: {
          type: 'object',
          properties: {
            url: {
              type: 'string',
              description: 'The base URL to crawl'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of pages to crawl',
              default: 10
            }
          },
          required: ['url']
        }
      },
      {
        name: 'search_web',
        description: 'Searches the web and returns relevant results. Use this to find current information about music industry trends, distribution platforms, promotional opportunities, or specific resources for artists.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'The search query'
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results to return',
              default: 5
            }
          },
          required: ['query']
        }
      },
      {
        name: 'fetch_knowledge',
        description: 'Fetch entries from the knowledge table in Supabase. Optionally filter by exact title. Returns title and note.',
        parameters: {
          type: 'object',
          properties: {
            title: {
              type: 'string',
              description: 'Exact title to fetch (optional)'
            },
            limit: {
              type: 'number',
              description: 'Maximum rows to return (default 10)',
              default: 10
            }
          }
        }
      },
      {
        name: 'search_knowledge',
        description: 'Full-text like search across title and note in the knowledge table. Returns matching rows with title and note.',
        parameters: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search term to look for in title and note'
            },
            limit: {
              type: 'number',
              description: 'Maximum rows to return (default 10)',
              default: 10
            }
          },
          required: ['query']
        }
      }
    ]
  }
];

// Middleware
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:3000';
app.use(cors({
  origin: ALLOWED_ORIGIN,
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Gemini Live Chatbot API' });
});

app.post('/api/token', async (req, res) => {
  try {
    const { mode = 'audio' } = req.body;
    
    const client = new GoogleGenAI({ 
      apiKey: GEMINI_API_KEY,
      httpOptions: { apiVersion: 'v1alpha' }
    });
    
    const expireTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();
    const newSessionExpireTime = new Date(Date.now() + 5 * 60 * 1000).toISOString();
    
    const responseModality = mode === 'audio' ? ['AUDIO'] : ['TEXT'];
    
    const token = await client.authTokens.create({
      config: {
        uses: 1,
        expireTime: expireTime,
        newSessionExpireTime: newSessionExpireTime,
        liveConnectConstraints: {
          model: 'gemini-2.5-flash-native-audio-preview-09-2025',
          config: {
            sessionResumption: {},
            responseModalities: responseModality,
            systemInstruction: MIGO_SYSTEM_INSTRUCTION,
            tools: toolDeclarations,
            inputAudioTranscription: {},
            outputAudioTranscription: mode === 'audio' ? {} : undefined,
          }
        },
        httpOptions: { apiVersion: 'v1alpha' }
      }
    });
    
    res.json({
      token: token.name,
      model: 'gemini-2.5-flash-native-audio-preview-09-2025',
      mode: mode
    });
    
  } catch (error) {
    console.error('Token creation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// WebSocket handler for text chat
wss.on('connection', async (ws) => {
  console.log('Client connected');
  
  let geminiSession = null;
  const responseQueue = [];
  
  try {
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    const model = 'gemini-live-2.5-flash-preview';
    const config = {
      responseModalities: [Modality.TEXT],
      systemInstruction: MIGO_SYSTEM_INSTRUCTION,
      tools: toolDeclarations
    };
    
    // Helper to wait for messages
    async function waitMessage() {
      let done = false;
      let message = undefined;
      while (!done) {
        message = responseQueue.shift();
        if (message) {
          done = true;
        } else {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      }
      return message;
    }
    
    // Handle tool calls (Firecrawl + Supabase knowledge)
    async function handleToolCall(toolCall) {
      const functionResponses = [];

      for (const fc of toolCall.functionCalls) {
        console.log(`Executing tool: ${fc.name}`, fc.args);
        
        try {
          let result;

          switch (fc.name) {
            case 'scrape_url':
              if (!firecrawl) {
                functionResponses.push({ id: fc.id, name: fc.name, response: { error: 'Firecrawl not configured' } });
                break;
              }
              result = await firecrawl.scrape(fc.args.url, {
                formats: fc.args.formats || ['markdown']
              });
              functionResponses.push({
                id: fc.id,
                name: fc.name,
                response: {
                  success: true,
                  data: result.markdown || result.html || JSON.stringify(result)
                }
              });
              break;

            case 'crawl_website':
              if (!firecrawl) {
                functionResponses.push({ id: fc.id, name: fc.name, response: { error: 'Firecrawl not configured' } });
                break;
              }
              result = await firecrawl.crawl(fc.args.url, {
                limit: fc.args.limit || 10,
                scrapeOptions: { formats: ['markdown'] }
              });
              functionResponses.push({
                id: fc.id,
                name: fc.name,
                response: {
                  success: true,
                  data: result.data ? result.data.map(doc => doc.markdown).join('\n\n---\n\n') : 'No data found'
                }
              });
              break;

            case 'search_web':
              if (!firecrawl) {
                functionResponses.push({ id: fc.id, name: fc.name, response: { error: 'Firecrawl not configured' } });
                break;
              }
              result = await firecrawl.search(fc.args.query, {
                limit: fc.args.limit || 5,
                scrapeOptions: { formats: ['markdown'] }
              });
              functionResponses.push({
                id: fc.id,
                name: fc.name,
                response: {
                  success: true,
                  data: result.data ? result.data.map(item => `${item.title}\n${item.url}\n${item.markdown || item.description || ''}`).join('\n\n---\n\n') : 'No results found'
                }
              });
              break;

            case 'fetch_knowledge': {
              if (!supabase) {
                functionResponses.push({ id: fc.id, name: fc.name, response: { error: 'Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.' } });
                break;
              }
              const limit = fc.args.limit || 10;
              const title = fc.args.title;
              let query = supabase.from('knowledge').select('title,note');
              if (title) {
                query = query.eq('title', title).limit(limit);
              } else {
                query = query.limit(limit);
              }
              const { data, error } = await query;
              if (error) throw new Error(error.message);
              functionResponses.push({ id: fc.id, name: fc.name, response: { success: true, data } });
              break;
            }

            case 'search_knowledge': {
              if (!supabase) {
                functionResponses.push({ id: fc.id, name: fc.name, response: { error: 'Supabase not configured. Please set SUPABASE_URL and SUPABASE_ANON_KEY.' } });
                break;
              }
              const limit = fc.args.limit || 10;
              const queryText = fc.args.query || '';
              // ILIKE search across title and note
              const { data, error } = await supabase
                .from('knowledge')
                .select('title,note')
                .or(`title.ilike.%${queryText}%,note.ilike.%${queryText}%`)
                .limit(limit);
              if (error) throw new Error(error.message);
              functionResponses.push({ id: fc.id, name: fc.name, response: { success: true, data } });
              break;
            }

            default:
              functionResponses.push({
                id: fc.id,
                name: fc.name,
                response: { error: `Unknown function: ${fc.name}` }
              });
          }
        } catch (error) {
          console.error(`Error executing ${fc.name}:`, error);
          functionResponses.push({
            id: fc.id,
            name: fc.name,
            response: { error: error.message }
          });
        }
      }

      return functionResponses;
    }

    // Process messages from Gemini
    async function processGeminiMessages() {
      while (geminiSession && ws.readyState === 1) {
        try {
          const message = await waitMessage();
          
          if (message.text) {
            ws.send(JSON.stringify({
              type: 'text',
              text: message.text
            }));
          }
          
          // Handle tool calls
          if (message.toolCall) {
            console.log('Tool call received:', message.toolCall);
            const functionResponses = await handleToolCall(message.toolCall);
            geminiSession.sendToolResponse({ functionResponses });
          }
          
          if (message.serverContent && message.serverContent.turnComplete) {
            ws.send(JSON.stringify({
              type: 'turn_complete'
            }));
          }
        } catch (error) {
          console.error('Error processing message:', error);
          break;
        }
      }
    }
    
    // Connect to Gemini
    geminiSession = await ai.live.connect({
      model: model,
      config: config,
      callbacks: {
        onopen: () => {
          console.log('Gemini session opened');
        },
        onmessage: (message) => {
          responseQueue.push(message);
        },
        onerror: (e) => {
          console.error('Gemini error:', e.message);
          ws.send(JSON.stringify({
            type: 'error',
            error: e.message
          }));
        },
        onclose: (e) => {
          console.log('Gemini session closed:', e.reason);
        }
      }
    });
    
    // Start processing messages
    processGeminiMessages();
    
    // Handle messages from client
    ws.on('message', async (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'text' && message.message) {
          geminiSession.sendClientContent({
            turns: message.message,
            turnComplete: true
          });
        }
      } catch (error) {
        console.error('Error handling client message:', error);
      }
    });
    
  } catch (error) {
    console.error('Connection error:', error);
    ws.send(JSON.stringify({
      type: 'error',
      error: error.message
    }));
  }
  
  ws.on('close', () => {
    console.log('Client disconnected');
    if (geminiSession) {
      try {
        geminiSession.close();
      } catch (e) {
        console.error('Error closing Gemini session:', e);
      }
    }
  });
  
  ws.on('error', (error) => {
    console.error('WebSocket error:', error);
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`WebSocket available at ws://localhost:${PORT}/ws/chat`);
});
