import { readFileSync, existsSync, mkdirSync, appendFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
let input;
try { input = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { console.log(JSON.stringify({ systemMessage: 'FAIL: nieprawidłowe wejście hooka.' })); process.exit(1); }
const event = input.hook_event_name || process.argv[2];
const git = (...args) => execFileSync('git', ['-C', root, ...args], { encoding: 'utf8', timeout: 4000 }).trim();
const progress = readFileSync(resolve(root, 'PROGRESS.md'), 'utf8');
const state = { date: new Date().toISOString(), event, session: input.session_id || null, branch: git('branch', '--show-current'), commit: git('rev-parse', 'HEAD'), dirty: git('status', '--porcelain'), handoffPresent: progress.includes('SESSION HANDOFF'), invocation: process.env.PREZENT_HOOK_TEST === '1' ? 'manual-test' : 'runtime-candidate' };
mkdirSync(resolve(root, 'reports'), { recursive: true });
const log = resolve(root, 'reports/hooks.jsonl');
if (existsSync(log) && readFileSync(log).length > 262144) writeFileSync(log, '');
appendFileSync(log, JSON.stringify({ ...state, dirty: undefined }) + '\n');
let output = {};
if (['SessionStart', 'UserPromptSubmit'].includes(event)) output = { hookSpecificOutput: { hookEventName: event, additionalContext: `Prezent Mapy: ${state.branch} @ ${state.commit.slice(0, 7)}. Odczytaj PROGRESS.md / SESSION HANDOFF i TASKS.md przed zmianami. Handoff: ${state.handoffPresent ? 'obecny' : 'BRAK'}.` } };
if (event === 'PreToolUse' && /git\s+push[^\n]*--force|reset\s+--hard|clean\s+-fd/.test(JSON.stringify(input.tool_input || {}))) output = { systemMessage: 'Wykryto operację destrukcyjną: sprawdź zgodę użytkownika i możliwość odtworzenia danych.' };
if (['PreCompact', 'Stop', 'PostToolUse'].includes(event)) {
  writeFileSync(resolve(root, 'reports/session-state.json'), JSON.stringify(state, null, 2));
  if (event === 'Stop' && !state.handoffPresent) output = { systemMessage: 'Brak SESSION HANDOFF w PROGRESS.md — uzupełnij przed następną iteracją.' };
}
console.log(JSON.stringify(output));
