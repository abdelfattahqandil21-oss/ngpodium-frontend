import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default async function handler(req, res) {
  try {
    // Import the Angular Universal server
    const { app } = await import('../dist/ngpodium/server/server.mjs');
    
    // Handle the request with Angular Universal
    app(req, res);
  } catch (error) {
    console.error('SSR Error:', error);
    
    // Fallback to static index.html
    try {
      const indexPath = join(__dirname, '../dist/ngpodium/browser/index.html');
      const indexHtml = readFileSync(indexPath, 'utf-8');
      res.setHeader('Content-Type', 'text/html');
      res.status(200).send(indexHtml);
    } catch (fallbackError) {
      res.status(500).json({ error: 'Server error' });
    }
  }
}
