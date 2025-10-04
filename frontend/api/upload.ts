import type { VercelRequest, VercelResponse } from '@vercel/node';
import { GoogleGenAI } from '@google/genai';

export const config = {
  api: {
    bodyParser: false, // Disable body parsing, we'll handle it manually
  },
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
  }

  try {
    // Parse multipart form data
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    
    // Extract file data from multipart form
    const boundary = req.headers['content-type']?.split('boundary=')[1];
    if (!boundary) {
      return res.status(400).json({ error: 'Invalid content type' });
    }

    // Simple multipart parser (in production, use a library like 'busboy')
    const parts = buffer.toString('binary').split(`--${boundary}`);
    let fileData: Buffer | null = null;
    let fileName = '';
    let mimeType = '';

    for (const part of parts) {
      if (part.includes('Content-Disposition: form-data; name="file"')) {
        const match = part.match(/filename="(.+?)"/);
        if (match) {
          fileName = match[1];
        }
        
        const mimeMatch = part.match(/Content-Type: (.+?)\r\n/);
        if (mimeMatch) {
          mimeType = mimeMatch[1];
        }

        // Extract binary data after double CRLF
        const dataStart = part.indexOf('\r\n\r\n') + 4;
        const dataEnd = part.lastIndexOf('\r\n');
        if (dataStart > 3 && dataEnd > dataStart) {
          fileData = Buffer.from(part.substring(dataStart, dataEnd), 'binary');
        }
      }
    }

    if (!fileData || !mimeType) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Upload to Gemini Files API
    const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    
    // Write file temporarily (Vercel provides /tmp)
    const fs = await import('fs/promises');
    const path = await import('path');
    const tmpPath = path.join('/tmp', fileName || 'upload');
    await fs.writeFile(tmpPath, fileData);

    const uploadedFile = await ai.files.upload({
      file: tmpPath,
      config: { mimeType }
    });

    // Clean up temp file
    await fs.unlink(tmpPath);

    res.status(200).json({
      uri: uploadedFile.uri,
      mimeType: uploadedFile.mimeType,
      name: uploadedFile.name,
      sizeBytes: uploadedFile.sizeBytes
    });

  } catch (error: any) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
}
