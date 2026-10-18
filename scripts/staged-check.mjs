import { execFileSync } from 'node:child_process';
const git = args => execFileSync('git', args, { encoding: 'utf8', maxBuffer: 30 * 1024 * 1024 });
const names = git(['diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z']).split('\0').filter(Boolean);
for (const name of names) {
  if (/\.(?:jpg|jpeg|png|heic|prezent|sqlite|db|exe)$/i.test(name) && !name.startsWith('tests/fixtures/')) throw new Error(`Plik danych użytkownika lub binarny: ${name}`);
  const size = Number(git(['cat-file', '-s', `:${name}`]));
  if (size > 5 * 1024 * 1024) throw new Error(`Plik przekracza 5 MB: ${name}`);
  if (/lock$|lock\.json$/.test(name)) continue;
  const content = git(['show', `:${name}`]);
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\bgh[pousr]_[A-Za-z0-9]{30,}|\bsk-proj-[A-Za-z0-9_-]{20,}/.test(content)) throw new Error(`Potencjalny sekret: ${name}`);
}
console.log(`PASS: kontrola ${names.length} plików staged (heurystyczna, nie pełny audyt sekretów).`);
