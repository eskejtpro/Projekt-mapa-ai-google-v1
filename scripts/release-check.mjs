import { existsSync, readFileSync, readdirSync } from 'node:fs';
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const artifacts = existsSync('release') ? readdirSync('release').filter(f => f.endsWith('.exe')) : [];
const report = existsSync('reports/verification.json') ? JSON.parse(readFileSync('reports/verification.json', 'utf8')) : null;
console.log(JSON.stringify({ version: pkg.version, webVerification: report?.complete === true, windowsArtifacts: artifacts, ready: false, reason: 'Wymagane aktualne pakiety, testy instalacji/deinstalacji oraz zamknięcie kryteriów map offline, TV i bezpieczeństwa przed wydaniem Windows.' }, null, 2));
process.exitCode = 1;
