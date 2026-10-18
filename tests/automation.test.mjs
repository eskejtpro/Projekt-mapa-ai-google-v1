import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const run = root => spawnSync(process.execPath, ['scripts/automation-check.mjs', ...(root ? ['--root', root] : [])], { encoding: 'utf8' });

test('walidator automatyzacji przechodzi na aktualnym repo', () => {
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /kontrola statyczna/);
});

test('walidator nie zalicza brakujących plików i skryptów', () => {
  const root = mkdtempSync(join(tmpdir(), 'prezent-automation-'));
  try {
    mkdirSync(join(root, '.agents', 'skills'), { recursive: true });
    writeFileSync(join(root, 'package.json'), JSON.stringify({ scripts: {} }));
    const result = run(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Brak skryptu npm: verify/);
    assert.match(result.stderr, /Brak pliku: AGENTS.md/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('walidator odrzuca błędną składnię hooks.json', () => {
  const root = mkdtempSync(join(tmpdir(), 'prezent-hooks-'));
  try {
    mkdirSync(join(root, '.codex'), { recursive: true });
    mkdirSync(join(root, '.agents', 'skills'), { recursive: true });
    writeFileSync(join(root, 'package.json'), JSON.stringify({ scripts: {} }));
    writeFileSync(join(root, '.codex', 'hooks.json'), '{broken');
    const result = run(root);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /Niepoprawny JSON: .codex\/hooks.json/);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
