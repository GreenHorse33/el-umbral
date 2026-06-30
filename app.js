const thread = document.getElementById('thread');
const form = document.getElementById('reply-form');
const input = document.getElementById('reply-input');
const hint = document.getElementById('hint');

const STORAGE_KEY = 'el-umbral-historial';

let messages = [];
let closed = false;

const OPENING = '¿Qué es algo que te está costando, ahora mismo, de verdad?';

function addLine(text, cls) {
  const div = document.createElement('div');
  div.className = `line ${cls}`;
  div.textContent = text;
  thread.appendChild(div);
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  return div;
}

function addThinking() {
  const div = document.createElement('div');
  div.className = 'line guide thinking';
  div.innerHTML = '<span>...</span>';
  thread.appendChild(div);
  return div;
}

function renderClosing(raw) {
  const lines = raw.split('\n').map((l) => l.trim()).filter(Boolean);
  let atributo = '';
  let frase = '';
  let gesto = '';

  lines.forEach((l) => {
    if (l.toLowerCase().startsWith('atributo:')) atributo = l.split(':').slice(1).join(':').trim();
    if (l.toLowerCase().startsWith('frase:')) frase = l.split(':').slice(1).join(':').trim().replace(/^"|"$/g, '');
    if (l.toLowerCase().startsWith('gesto:')) gesto = l.split(':').slice(1).join(':').trim();
  });

  addLine(atributo, 'closing-attr');
  addLine(`"${frase}"`, 'closing-phrase');
  addLine(gesto, 'closing-gesture');

  closed = true;
  form.classList.add('hidden');
  hint.classList.add('hidden');

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ atributo, frase, gesto, fecha: new Date().toISOString() })
  );
}

async function sendToGuide() {
  const thinkingEl = addThinking();

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
    });
    const data = await res.json();
    thinkingEl.remove();

    if (data.error) {
      addLine(`Algo se interrumpió: ${data.error}`, 'guide');
      return;
    }

    const text = data.text.trim();

    if (text.startsWith('[CIERRE]')) {
      renderClosing(text.replace('[CIERRE]', '').trim());
    } else {
      addLine(text, 'guide');
      messages.push({ role: 'assistant', content: text });
    }
  } catch (err) {
    thinkingEl.remove();
    addLine('No pude conectar. Revisá que el servidor esté corriendo.', 'guide');
  }
}

function autoResize() {
  input.style.height = 'auto';
  input.style.height = `${input.scrollHeight}px`;
}

input.addEventListener('input', autoResize);

form.addEventListener('submit', (e) => {
  e.preventDefault();
});

input.addEventListener('keydown', (e) => {
  if (closed) return;
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    const value = input.value.trim();
    if (!value) return;

    addLine(value, 'you');
    messages.push({ role: 'user', content: value });
    input.value = '';
    autoResize();
    sendToGuide();
  }
});

function start() {
  addLine(OPENING, 'guide');
  messages.push({ role: 'assistant', content: OPENING });
  input.focus();
  setTimeout(() => hint.classList.add('show'), 1200);
}

start();
