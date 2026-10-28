// Uso: python3 -m http.server 5301 (nesta pasta) e `node run.mjs none,blur,canvas3,vector1 anim`
// Requer `playwright-core` + um Chromium instalado. Métrica principal: fps (a CPU satura em 1 núcleo sem GPU).
import fs from 'node:fs';
import { execSync } from 'node:child_process';
import { chromium } from 'playwright-core'
const TICKS = 100; // CLK_TCK
function tree() { try { return execSync("pgrep -f ms-playwright", { encoding: 'utf8' }).split('\n').filter(Boolean).map(Number); } catch { return []; } }
function treeOld(pid) { // (legado, não usado) const out = [pid]; try { const kids = execSync(`pgrep -P ${pid}`, { encoding: 'utf8' }).split('\n').filter(Boolean).map(Number); for (const k of kids) out.push(...tree(k)); } catch {} return out; }
function cpu(pids) { let t = 0; for (const p of pids) { try { const s = fs.readFileSync(`/proc/${p}/stat`, 'utf8'); const f = s.slice(s.lastIndexOf(')') + 2).split(' '); t += Number(f[11]) + Number(f[12]); } catch {} } return t / TICKS; }
const variants = process.argv[2].split(','); const mode = process.argv[3] || 'anim'; const big = process.argv[4] === 'big';
const WINDOW_MS = 5000;
const browser = await chromium.launch({ args: ['--enable-gpu-rasterization', '--ignore-gpu-blocklist'] });
const results = [];
for (const v of variants) {
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  const errs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => m.type() === 'error' && errs.push(m.text()));
  const t0 = Date.now();
  await page.goto(`http://localhost:5301/index.html?v=${v}&anim=${mode === 'anim' ? 1 : 0}${big ? '&big=1' : ''}${process.env.EXTRA || ''}`);
  await page.waitForFunction(() => window.__ready);
  const setupMs = await page.evaluate(() => performance.now());
  await page.waitForTimeout(1500);
  // fps via rAF
  await page.evaluate(() => { window.__f = 0; const t = () => { window.__f++; requestAnimationFrame(t); }; requestAnimationFrame(t); });
  const pids = tree(); const c0 = cpu(pids); const s = Date.now();
  await page.waitForTimeout(WINDOW_MS);
  const el = (Date.now() - s) / 1000; const c1 = cpu(tree()); const frames = await page.evaluate(() => window.__f);
  if (process.env.SHOT) await page.screenshot({ path: `${process.env.SHOT}-${v}.png` });
  results.push({ variant: v, mode, cpuPerSec: +((c1 - c0) / el).toFixed(2), fps: +(frames / el).toFixed(1), setupMs: +setupMs.toFixed(0), errs: errs.slice(0, 2).join('|') });
  await page.close();
}
console.table(results);
await browser.close();
