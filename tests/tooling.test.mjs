import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const config = JSON.parse(readFileSync('.codex/hooks.json', 'utf8'));
for (const event of Object.keys(config.hooks)) {
  test(`hook ${event} wykonuje się i zwraca JSON`, () => {
    const result = spawnSync(process.execPath, ['.codex/hooks/lifecycle.mjs'], { input: JSON.stringify({ hook_event_name: event, session_id: 'tooling-test' }), encoding: 'utf8', env: { ...process.env, PREZENT_HOOK_TEST: '1' } });
    assert.equal(result.status, 0, result.stderr);
    const output = JSON.parse(result.stdout);
    if (['SessionStart', 'UserPromptSubmit'].includes(event)) {
      assert.equal(output.hookSpecificOutput.hookEventName, event);
      assert.match(output.hookSpecificOutput.additionalContext, /PROGRESS.md/);
    }
  });
}
test('pre-tool ostrzega o force push i nie blokuje zwykłych odczytów', () => {
  const run = command => JSON.parse(spawnSync(process.execPath, ['.codex/hooks/lifecycle.mjs'], { input: JSON.stringify({ hook_event_name: 'PreToolUse', tool_input: { command } }), encoding: 'utf8', env: { ...process.env, PREZENT_HOOK_TEST: '1' } }).stdout);
  assert.match(run('git push --force').systemMessage, /destrukcyjn/);
  assert.deepEqual(run('git status'), {});
});
test('release gate nie deklaruje gotowości bez powłoki Electron', () => {
  const result = spawnSync(process.execPath, ['scripts/release-check.mjs'], { encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.equal(JSON.parse(result.stdout).ready, false);
});
test('Windows launcher działa z src i ścieżką ze spacjami', { skip: process.platform !== 'win32' }, () => {
  const definition = config.hooks.SessionStart[0].hooks[0];
  const command = definition.commandWindows.replace(/^powershell\.exe -NoProfile -Command "/, '').replace(/"$/, '');
  const result = spawnSync('powershell.exe', ['-NoProfile', '-Command', command], { cwd: 'src', input: JSON.stringify({ hook_event_name: 'SessionStart' }), encoding: 'utf8', env: { ...process.env, PREZENT_HOOK_TEST: '1' } });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).hookSpecificOutput.hookEventName, 'SessionStart');
});

test('Windows launcher nie przekazuje ścieżki Unicode przez wynik git', { skip: process.platform !== 'win32' }, () => {
  const definition = config.hooks.SessionStart[0].hooks[0];
  assert.match(definition.commandWindows, /--show-cdup/);
  assert.doesNotMatch(definition.commandWindows, /--show-toplevel/);
  const command = definition.commandWindows.replace(/^powershell\.exe -NoProfile -Command "/, '').replace(/"$/, '');
  const result = spawnSync('powershell.exe', ['-NoProfile', '-Command', command], {
    cwd: 'src',
    input: JSON.stringify({ hook_event_name: 'SessionStart' }),
    encoding: 'utf8',
    env: { ...process.env, PREZENT_HOOK_TEST: '1' },
  });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(JSON.parse(result.stdout).hookSpecificOutput.hookEventName, 'SessionStart');
});
