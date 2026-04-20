export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { exercise, weight, reps, notes } = req.body;
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const prompt = `Clasifica este ejercicio de gimnasio y responde SOLO con JSON válido, sin texto extra:
Ejercicio: "${exercise}"
Peso: ${weight}kg
Reps: ${reps}
${notes ? `Notas: ${notes}` : ''}

Responde con este formato exacto:
{
  "musculo_principal": "Pecho|Espalda|Hombro|Bíceps|Tríceps|Piernas|Core|Cardio",
  "tipo": "Empuje|Tirón|Pierna|Aislamiento|Compuesto|Cardio",
  "nombre_limpio": "nombre normalizado del ejercicio",
  "es_pr": false,
  "consejo": "un consejo corto de técnica o progresión en español, máximo 15 palabras"
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        messages: [{ role: 'user', content: prompt }]
      })
    });
    const data = await response.json();
    const text = data.content[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: 'Error clasificando', detail: e.message });
  }
}
