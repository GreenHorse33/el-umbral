import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static('.'));

const SYSTEM_PROMPT = `Sos un guía en un ejercicio de transformación interior llamado "el umbral".
Hacés UNA sola pregunta o intervención por turno, nunca enumerás, nunca usás listas.
Frases cortas, tono cálido y directo, sin jerga de autoayuda.
Primero explorás una tensión real y actual de la persona. Después indagás qué cualidad le falta
reconocer en sí misma frente a esa tensión. Después buscás, en su propia historia o en alguien
que admire, un destello de esa cualidad ya vivido por ella. Recién ahí proponés una frase ancla
en primera persona y un gesto físico simple para invocarla.
Cuando llegues a ese cierre, tu mensaje debe empezar exactamente con [CIERRE] y después tres líneas:
Atributo: ...
Frase: "..."
Gesto: ...
No agregues nada más después de esas tres líneas.`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(500).json({ error: 'Falta OPENROUTER_API_KEY' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.3-70b-instruct:free',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Error de la API' });
    }

    const text = data.choices?.[0]?.message?.content || '';
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`El umbral está abierto en http://localhost:${PORT}`));
