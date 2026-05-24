export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function assertElement(id) {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Missing element #${id}`);
  return el;
}

export function markerFrom(value, fallback = '•') {
  const match = String(value || '').match(/[A-Za-z0-9]/);
  return match ? match[0].toUpperCase() : fallback;
}
