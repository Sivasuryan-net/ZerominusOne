import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // AI-Assisted Friendly Threat Explanation Endpoint
  app.post('/api/ai-explain', async (req, res) => {
    const { threatName, reason, category } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        summary: `What happened with ${threatName || 'this file'}?`,
        explanation: `This file attempted to perform suspicious actions without your permission. Our security check stopped it immediately to keep your device and personal files safe.`,
        recommendation: `We recommend removing this file to prevent any harm to your computer.`,
        isAiGenerated: false
      });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a friendly, reassuring consumer security expert talking to a non-technical home user.
Explain why a file named "${threatName}" was flagged for this reason: "${reason}".

Rules:
- Speak in plain, warm, reassuring language.
- DO NOT use technical jargon (no "payload", "obfuscation", "Z-score", "MITRE", "hash", "registry key").
- Keep it under 3 short sentences.
- Explain what the file tried to do in everyday terms (e.g., "tried to change system settings in secret", "downloaded hidden files").
- Give a clear, friendly recommendation.

Return JSON in this format:
{
  "summary": "Short title like 'Suspicious Behavior Detected'",
  "explanation": "Friendly 2-sentence explanation of what the file did.",
  "recommendation": "Simple advice like 'Removing this file keeps your personal information safe.'"
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();

      try {
        const parsed = JSON.parse(cleanJson);
        return res.json({ ...parsed, isAiGenerated: true });
      } catch {
        return res.json({
          summary: `Suspicious activity in ${threatName}`,
          explanation: text || `This file attempted to make changes to your system without asking.`,
          recommendation: `It is safest to remove this file from your device.`,
          isAiGenerated: true
        });
      }
    } catch (error) {
      console.error('Error in AI explanation endpoint:', error);
      return res.status(500).json({
        error: 'Failed to generate explanation',
        explanation: 'This file acted suspiciously by attempting unauthorized background changes.'
      });
    }
  });

  // Vite middleware for development mode
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
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
