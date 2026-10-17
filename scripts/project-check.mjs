import { existsSync, readFileSync } from 'node:fs';
const files = ['AGENTS.md', 'README.md', 'SETUP.md', 'GOALS.md', 'REQUIREMENTS.md', 'ROADMAP.md', 'TASKS.md', 'DEFINITION_OF_DONE.md', 'ARCHITECTURE.md', 'PROGRESS.md', 'DECISIONS.md', 'TESTING.md', 'CHANGELOG.md', '.codex/config.toml', '.agents/skills/project-continuity/SKILL.md'];
let failures = 0;
for (const file of files) {
  const ok = existsSync(file) && readFileSync(file, 'utf8').trim().length > 0;
  console.log(`${ok ? 'PASS' : 'FAIL'} ${file}`);
  if (!ok) failures++;
}
process.exitCode = failures ? 1 : 0;
