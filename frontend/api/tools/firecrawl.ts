import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
  
  if (!FIRECRAWL_API_KEY) {
    return res.status(500).json({ error: 'Firecrawl not configured' });
  }

  try {
    const { name, args } = req.body;

    if (!name || !args) {
      return res.status(400).json({ error: 'Missing name or args' });
    }

    let result;
    const baseUrl = 'https://api.firecrawl.dev/v1';

    switch (name) {
      case 'scrape_url': {
        const response = await fetch(`${baseUrl}/scrape`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: args.url,
            formats: args.formats || ['markdown']
          })
        });

        if (!response.ok) {
          throw new Error(`Firecrawl scrape failed: ${response.statusText}`);
        }

        const data = await response.json();
        result = {
          success: true,
          data: data.markdown || data.html || JSON.stringify(data)
        };
        break;
      }

      case 'crawl_website': {
        const response = await fetch(`${baseUrl}/crawl`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            url: args.url,
            limit: args.limit || 10,
            scrapeOptions: { formats: ['markdown'] }
          })
        });

        if (!response.ok) {
          throw new Error(`Firecrawl crawl failed: ${response.statusText}`);
        }

        const data = await response.json();
        result = {
          success: true,
          data: data.data ? data.data.map((doc: any) => doc.markdown).join('\n\n---\n\n') : 'No data found'
        };
        break;
      }

      case 'search_web': {
        const response = await fetch(`${baseUrl}/search`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${FIRECRAWL_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: args.query,
            limit: args.limit || 5,
            scrapeOptions: { formats: ['markdown'] }
          })
        });

        if (!response.ok) {
          throw new Error(`Firecrawl search failed: ${response.statusText}`);
        }

        const data = await response.json();
        result = {
          success: true,
          data: data.data 
            ? data.data.map((item: any) => `${item.title}\n${item.url}\n${item.markdown || item.description || ''}`).join('\n\n---\n\n')
            : 'No results found'
        };
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown function: ${name}` });
    }

    res.status(200).json(result);

  } catch (error: any) {
    console.error('Firecrawl tool error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
