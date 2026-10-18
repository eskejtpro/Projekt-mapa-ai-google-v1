import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { spawn } from 'node:child_process';

export function findProjectRoot(startDirectory = process.cwd()) {
  let directory = resolve(startDirectory);
  while (true) {
    if (existsSync(join(directory, '.codex', 'hooks', 'lifecycle.mjs'))) return directory;
    const parent = dirname(directory);
    if (parent === directory) return null;
    directory = parent;
  }
}

const root = findProjectRoot();
if (!root) {
  console.error('Nie znaleziono katalogu projektu z .codex/hooks/lifecycle.mjs.');
  process.exit(1);
}

const child = spawn(process.execPath, [join(root, '.codex', 'hooks', 'lifecycle.mjs')], {
  cwd: root,
  env: process.env,
  stdio: 'inherit',
});

child.on('error', (error) => {
  console.error(error.message);
  process.exit(1);
});

child.on('exit', (code, signal) => process.exit(code ?? (signal ? 1 : 0)));
