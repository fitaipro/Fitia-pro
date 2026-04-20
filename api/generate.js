// api/generate.js
// Vercel Serverless Function — appel sécurisé à l'API Claude
// La clé API reste côté serveur, jamais exposée au navigateur

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { prompt, userData } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: 'Prompt manquant' });
  }

  // Récupère la clé depuis les variables d'environnement Vercel
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Clé API non configurée' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: 'Tu es un coach sportif expert en musculation et nutrition. Tu génères des programmes précis, motivants et personnalisés. Utilise des emojis pour structurer les sections. Sois concis mais complet.',
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      console.error('Anthropic API error:', err);
      return res.status(500).json({ error: 'Erreur API Claude' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    // Log usage (optionnel — pour monitoring)
    console.log(`[FitAI] Programme généré | Objectif: ${userData?.objectif} | Tokens: ${data.usage?.output_tokens}`);

    return res.status(200).json({ text });

  } catch (err) {
    console.error('Erreur serveur:', err);
    return res.status(500).json({ error: 'Erreur serveur interne' });
  }
}
