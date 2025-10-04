import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
  
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return res.status(500).json({ error: 'Supabase not configured' });
  }

  try {
    const { name, args } = req.body;

    if (!name || !args) {
      return res.status(400).json({ error: 'Missing name or args' });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    switch (name) {
      case 'fetch_knowledge': {
        const limit = args.limit || 10;
        const title = args.title;
        
        let query = supabase.from('knowledge').select('title,note');
        
        if (title) {
          query = query.eq('title', title).limit(limit);
        } else {
          query = query.limit(limit);
        }
        
        const { data, error } = await query;
        
        if (error) {
          throw new Error(error.message);
        }
        
        res.status(200).json({ success: true, data });
        break;
      }

      case 'search_knowledge': {
        const limit = args.limit || 10;
        const queryText = args.query || '';
        
        const { data, error } = await supabase
          .from('knowledge')
          .select('title,note')
          .or(`title.ilike.%${queryText}%,note.ilike.%${queryText}%`)
          .limit(limit);
        
        if (error) {
          throw new Error(error.message);
        }
        
        res.status(200).json({ success: true, data });
        break;
      }

      default:
        return res.status(400).json({ error: `Unknown function: ${name}` });
    }

  } catch (error: any) {
    console.error('Knowledge tool error:', error);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}
