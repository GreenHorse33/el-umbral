# el umbral

Una conversación guiada, no un formulario. La IA hace una pregunta por vez, en pantalla
completa, sin botones ni menús, hasta que aparece —no se elige— un atributo propio, una
frase ancla en primera persona, y un gesto para invocarla. No hay nada que diseñar de
antemano: solo respondés.

## Cómo correrlo

1. Subí esta carpeta a un repo de GitHub y abrilo en [github.dev](https://github.dev) o en
   un Codespace (también funciona local, con cualquier VSCode).
2. Abrí una terminal integrada (`` Ctrl/Cmd + ` ``) — en github.dev necesitás un Codespace
   para tener terminal real, github.dev solo no ejecuta Node.
3. Copiá `.env.example` a `.env` y pegá ahí tu API key de Anthropic:
   ```
   cp .env.example .env
   ```
4. Instalá dependencias y arrancá el servidor:
   ```
   npm install
   npm start
   ```
5. Abrí `http://localhost:3000` (o el puerto que te muestre el Codespace al reenviarlo).

## Cómo está pensado

- `server.js` es el único lugar que toca la API de Claude. Tu API key nunca llega al
  navegador.
- El "guion" de la conversación —cómo pregunta, cuándo cierra, qué tono usa— vive en el
  `SYSTEM_PROMPT` dentro de `server.js`. Si querés que la indagación vaya más lento, más
  rápido, o toque otro tipo de tensiones, se edita ahí, en lenguaje natural, no en código.
- El cierre llega marcado con `[CIERRE]` y tres líneas (`Atributo`, `Frase`, `Gesto`); el
  cliente las separa y las muestra como un cierre visual distinto, y las guarda en
  `localStorage` del navegador para que no se pierdan al recargar.
- No hay base de datos ni cuentas. Es una sesión personal, en tu máquina.

## Si querés extenderlo

- Para guardar un historial de varias sesiones (no solo la última), `app.js` es el lugar:
  hoy sobreescribe una sola entrada en `localStorage`, se puede pasar fácilmente a un
  array con fecha.
- Para que el gesto de invocación se pueda "activar" después (por ejemplo con un timer o
  una notificación), conviene un segundo archivo HTML simple que lea ese mismo
  `localStorage` y lo muestre.
