import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

const rootIndex = process.argv.indexOf('--root');
const root = resolve(rootIndex >= 0 ? process.argv[rootIndex + 1] || '.' : '.');
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
const read = path => {
  const full = join(root, path);
  if (!existsSync(full)) { errors.push('Brak pliku: ' + path); return ''; }
  return readFileSync(full, 'utf8');
};
const json = path => {
  try { return JSON.parse(read(path)); }
  catch (error) { errors.push('Niepoprawny JSON: ' + path + ' (' + error.message + ')'); return {}; }
};

const pkg = json('package.json');
for (const name of ['verify', 'project:check', 'test:tooling', 'test:database', 'typecheck', 'build', 'release:check', 'hooks:install']) {
  check(typeof pkg.scripts?.[name] === 'string', 'Brak skryptu npm: ' + name);
}
const agents = read('AGENTS.md');
check(agents.includes('npm run verify'), 'AGENTS.md musi wskazywać pełną weryfikację');
check(agents.includes('DEFINITION_OF_DONE.md') || read('DEFINITION_OF_DONE.md').includes('DONE'), 'Brak odniesienia do Definition of Done');
const config = read('.codex/config.toml');
check(/hooks\s*=\s*true/.test(config), 'Brak jawnego ustawienia hooks=true w repo');
const hooks = json('.codex/hooks.json').hooks || {};
check(Object.keys(hooks).length > 0, 'Brak zdefiniowanych hooków Codex');
for (const [event, groups] of Object.entries(hooks)) {
  check(Array.isArray(groups) && groups.length > 0, 'Puste grupy hooków: ' + event);
  for (const group of Array.isArray(groups) ? groups : []) {
    check(Array.isArray(group.hooks) && group.hooks.length > 0, 'Brak handlera: ' + event);
    for (const handler of group.hooks || []) {
      check(handler.type === 'command', 'Nieobsługiwany typ hooka: ' + event);
      check(typeof handler.command === 'string' && handler.command.includes('.codex/hooks/'), 'Niepoprawna ścieżka hooka: ' + event);
      check(typeof handler.commandWindows === 'string' && handler.commandWindows.includes('.codex/hooks/'), 'Brak polecenia Windows: ' + event);
    }
  }
}
read('.codex/hooks/lifecycle.mjs');
const skillsDir = join(root, '.agents/skills');
if (!existsSync(skillsDir)) errors.push('Brak katalogu .agents/skills');
else {
  const names = new Set();
  for (const entry of readdirSync(skillsDir, { withFileTypes: true }).filter(x => x.isDirectory())) {
    const path = '.agents/skills/' + entry.name + '/SKILL.md';
    const skill = read(path);
    const frontmatter = skill.match(/^---\s*\r?\n([\s\S]*?)\r?\n---/);
    check(Boolean(frontmatter), 'Brak YAML frontmatter: ' + path);
    const name = frontmatter?.[1].match(/^name:\s*(.+)$/m)?.[1]?.trim();
    const description = frontmatter?.[1].match(/^description:\s*(.+)$/m)?.[1]?.trim();
    check(name === entry.name, 'Nazwa skilla nie zgadza się z katalogiem: ' + path);
    check(Boolean(description), 'Brak opisu skilla: ' + path);
    check(!names.has(name), 'Powielona nazwa skilla: ' + name);
    names.add(name);
  }
  check(names.size > 0, 'Brak skilli Codex');
}
for (const hook of ['.githooks/pre-commit', '.githooks/pre-push']) read(hook);
const ci = read('.github/workflows/ci.yml');
for (const expected of ['pull_request', 'windows-latest', 'npm ci', 'npm run verify', 'upload-artifact']) {
  check(ci.includes(expected), 'Brak wymaganego elementu CI: ' + expected);
}
const ignore = read('.gitignore');
for (const expected of ['reports/', 'release/', 'node_modules/']) {
  check(ignore.includes(expected), 'Brak ochrony w .gitignore: ' + expected);
}
if (errors.length) {
  for (const error of errors) console.error('FAIL ' + error);
  process.exitCode = 1;
} else {
  console.log('PASS: automatyzacja Codex, skille, Git hooks, skrypty npm i CI — kontrola statyczna.');
  console.log('UWAGA: statyczna kontrola nie potwierdza uruchomienia hooków przez klienta Codex ani testów Windows/TV.');
}
