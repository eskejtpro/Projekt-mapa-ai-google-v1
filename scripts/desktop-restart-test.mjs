import './test-environment.mjs';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const executable = require('electron');
const profile = mkdtempSync(path.join(tmpdir(), 'prezent-restart-test-'));
const steps = [];
for (const stage of ['write', 'read']) {
  const run = spawnSync(executable, ['.', '--smoke-test', `--smoke-profile=${profile}`, `--persistence-${stage}`], { cwd: process.cwd(), timeout: 120000, windowsHide: true });
  if (run.status !== 0) throw new Error(`Electron restart ${stage}: ${run.error?.message || run.stderr?.toString() || run.status}`);
  const report = JSON.parse(readFileSync('reports/desktop-smoke.json', 'utf8'));
  if (!report.passed || (stage === 'read' && !report.persistenceAfterRestart)) throw new Error(`Brak dowodu restart ${stage}`);
  steps.push({ stage, report });
}
mkdirSync('reports', { recursive: true });
writeFileSync('reports/desktop-restart.json', JSON.stringify({ passed: true, date: new Date().toISOString(), steps }, null, 2));
console.log('PASS: zdjęcie i opis przetrwały zamknięcie oraz nowy proces Electron.');
