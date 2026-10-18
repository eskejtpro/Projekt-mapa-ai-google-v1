import './test-environment.mjs';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, mkdirSync, writeFileSync, createReadStream } from 'node:fs';
import { createHash } from 'node:crypto';
import { tmpdir } from 'node:os';
import path from 'node:path';

const executable = path.resolve('release-current/win-unpacked/Prezent Mapy.exe');
const profile = mkdtempSync(path.join(tmpdir(), 'prezent-restart-test-packaged-'));
const steps = [];
for (const stage of ['write', 'read']) {
  const run = spawnSync(executable, ['--smoke-test', `--smoke-profile=${profile}`, `--persistence-${stage}`], { cwd: process.cwd(), timeout: 120000, windowsHide: true });
  assert.equal(run.status, 0, run.error?.message || run.stderr?.toString());
  const report = JSON.parse(readFileSync('reports/desktop-smoke.json', 'utf8'));
  assert.equal(report.passed, true);
  assert.equal(report.packaged, true);
  if (stage === 'read') assert.equal(report.persistenceAfterRestart, true);
  steps.push({ stage, report });
}
const artifacts = [];
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
for (const kind of ['Setup', 'Portable']) {
  const name = `Prezent-Mapy-${kind}-${version}-x64.exe`;
  const hash = createHash('sha256');
  for await (const chunk of createReadStream(path.resolve('release-current', name))) hash.update(chunk);
  artifacts.push({ name, sha256: hash.digest('hex') });
}
mkdirSync('reports', { recursive: true });
writeFileSync('reports/windows-audit.json', JSON.stringify({ passed: true, date: new Date().toISOString(), steps, artifacts, installationUpgradeUninstall: 'NOT RUN', windows11: 'UNVERIFIED' }, null, 2));
console.log('PASS: packaged Electron starts and preserves data after restart; artifact hashes recorded. Installation/upgrade/uninstall NOT RUN.');
