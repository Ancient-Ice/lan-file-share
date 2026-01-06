const BASE_STYLES = `
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600&display=swap" rel="stylesheet">
<style>
:root {
  --bg: #0b1220;
  --panel: #0d1526;
  --card: #111b30;
  --accent: #5eead4;
  --accent-strong: #22d3ee;
  --text: #e5e7eb;
  --muted: #9ca3af;
  --border: #1f2937;
  --shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
  --radius: 14px;
}
* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: 'Space Grotesk', 'Segoe UI', 'PingFang SC', 'Helvetica Neue', sans-serif;
  background: radial-gradient(circle at 20% 20%, rgba(94, 234, 212, 0.18), transparent 35%),
              radial-gradient(circle at 80% 0%, rgba(34, 211, 238, 0.16), transparent 30%),
              linear-gradient(135deg, #0b1220 0%, #0f172a 60%, #0b1220 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 18px;
  color: var(--text);
}
a { color: var(--accent); text-decoration: none; }
a:hover { color: var(--accent-strong); }
.shell { width: min(1100px, 100%); }
.glass {
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01));
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 24px;
  position: relative;
  overflow: hidden;
}
.header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
  flex-wrap: wrap;
}
.header h1 {
  margin: 4px 0 4px;
  font-size: 28px;
  letter-spacing: 0.01em;
}
.eyebrow {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--accent);
}
.muted { color: var(--muted); font-size: 14px; }
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid transparent;
  font-weight: 600;
  color: #041023;
  background: linear-gradient(135deg, var(--accent), var(--accent-strong));
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, background 0.2s;
  box-shadow: 0 10px 30px rgba(34, 211, 238, 0.25);
}
.btn:hover { transform: translateY(-1px); }
.btn:active { transform: translateY(0); }
.btn-secondary {
  background: transparent;
  color: var(--text);
  border: 1px solid var(--border);
  box-shadow: none;
}
.btn-ghost {
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
  border: 1px solid var(--border);
}
.list {
  list-style: none;
  padding: 0;
  margin: 18px 0 0;
  display: grid;
  gap: 10px;
}
.item {
  border: 1px solid var(--border);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  transition: transform 0.12s ease, border-color 0.12s ease, background 0.12s;
}
.item:hover {
  transform: translateY(-1px);
  border-color: rgba(94, 234, 212, 0.35);
  background: rgba(255, 255, 255, 0.05);
}
.item-left { display: flex; align-items: center; gap: 12px; min-width: 0; }
.item-link { color: inherit; text-decoration: none; display: flex; align-items: center; gap: 12px; min-width: 0; }
.item-link:hover { color: var(--accent-strong); }
.icon { font-size: 20px; line-height: 1; }
.name { font-weight: 600; color: var(--text); word-break: break-all; }
.meta { font-size: 13px; color: var(--muted); }
.actions { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
.path-bar {
  margin-top: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1px dashed var(--border);
  background: rgba(255, 255, 255, 0.02);
  color: var(--muted);
}
.form { display: flex; flex-direction: column; gap: 14px; margin-top: 16px; }
.field { display: flex; flex-direction: column; gap: 6px; color: var(--text); }
input[type="password"] {
  width: 100%;
  padding: 12px;
  border-radius: 10px;
  border: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.04);
  color: var(--text);
}
.notice { margin-top: 8px; font-size: 13px; color: var(--muted); }
.badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(94, 234, 212, 0.08);
  color: var(--accent);
  border: 1px solid rgba(94, 234, 212, 0.3);
  font-size: 13px;
}
@media (max-width: 720px) {
  body { padding: 18px 14px; }
  .header { flex-direction: column; }
  .actions { width: 100%; flex-wrap: wrap; }
  .actions .btn, .actions .btn-secondary, .actions .btn-ghost { flex: 1 1 auto; justify-content: center; }
  .item { flex-direction: column; align-items: flex-start; }
  .actions { width: 100%; justify-content: flex-start; }
}
</style>
`;

module.exports = BASE_STYLES;
