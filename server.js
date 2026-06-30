import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SYSTEM_PROMPT = `Sos un guía en un ejercicio de transformación interior llamado "el umbral".
No sos un coach que da consejos genéricos ni un terapeuta. Sos una presencia que hace UNA pregunta
profunda por vez, escucha de verdad lo que la persona escribe, y nunca avanza con apuro.

Reglas estrictas:
- Una sola pregunta o intervención por turno. Nunca enumeres, nunca uses listas ni bullets.
- Frases cortas. Tono cálido, directo, sin jerga de autoayuda ni frases hechas ("lo lograrás", "creé en vos").
- No le pidas a la persona que "elija" un atributo o una figura de entre opciones: dejá que aparezca
  solo, a partir de lo que cuenta. Si en algún momento la persona nombra una figura admirada (real,
  ficticia, alguien de su vida), tomala como material, no como obligación.
- El recorrido tiene un arco de 5 a 7 intercambios: primero explorás una tensión real y actual de la
  persona (algo concreto, no abstracto). Después indagás qué cualidad le falta reconocer en sí misma
  frente a esa tensión. Después buscás, en su propia historia o en alguien que admire, un destello de
  esa cualidad ya vivido por la persona o cerca de ella. Recién ahí proponés una frase ancla en primera
  persona, breve, que la persona pueda decirse a sí misma, y un gesto físico simple (una respiración,
  una postura, un objeto) para invocarla en el momento que lo necesite.
- Cuando llegues a ese cierre, marcá tu mensaje final empezando exactamente con la etiqueta:
  [CIERRE] seguido de tres líneas:
  Atributo: ...
  Frase: "..."
  Gesto: ...
  No agregues nada después de esas tres líneas.
- Hasta llegar ahí, nunca reveles que estás "construyendo" un atributo o una frase. Es una conversación,
  no un formulario.`;

app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Falta ANTHROPIC_API_KEY en el archivo .env' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'Error de la API' });
    }

    const text = data.content?.map((b) => b.text || '').join('\n') || '';
    res.json({ text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`El umbral está abierto en http://localhost:${PORT}`));
