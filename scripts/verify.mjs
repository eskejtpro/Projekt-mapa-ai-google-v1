import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
const steps = process.argv.includes('--quick') ? ['project:check', 'automation:check', 'typecheck', 'test', 'test:tooling'] : ['project:check', 'automation:check', 'lint', 'typecheck', 'test', 'test:tooling', 'test:database', 'build'];
const results = [];
for (const step of steps) {
  const start = performance.now();
  const npmCli = process.env.npm_execpath || join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js');
  const result = spawnSync(process.execPath, [npmCli, 'run', step], { stdio: 'inherit' });
  results.push({ step, status: result.status === 0 ? 'PASS' : 'FAIL', durationMs: Math.round(performance.now() - start) });
  if (result.status !== 0) break;
}
mkdirSync('reports', { recursive: true });
writeFileSync(process.argv.includes('--quick') ? 'reports/verification.quick.json' : 'reports/verification.json', JSON.stringify({ date: new Date().toISOString(), scope: process.argv.includes('--quick') ? 'quick' : 'full', commit: execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(), results, complete: results.length === steps.length && results.every(r => r.status === 'PASS') }, null, 2));
process.exitCode = results.length === steps.length && results.every(r => r.status === 'PASS') ? 0 : 1;
