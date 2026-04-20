export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { exercise, weight, reps, notes } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;
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
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 300 }
        })
      }
    );
    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: 'Error clasificando', detail: e.message });
  }
}
