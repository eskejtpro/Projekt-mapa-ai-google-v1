import { spawnSync } from 'node:child_process';

const environment = './scripts/test-environment.mjs';
const databaseTests = [
  'tests/database.test.cjs',
  'tests/media-store.test.cjs',
  'tests/offline-map.test.cjs',
  'tests/tv-discovery.test.cjs',
  'tests/remote-control.test.cjs',
  'tests/backup-manager.test.cjs',
  'tests/video-library.test.cjs',
  'tests/video-gps.test.cjs',
  'tests/video-response.test.cjs',
];
const backupTestFile = 'tests/library-backup.test.cjs';
const backupScenarios = [
  'tworzy przenośny backup SQLite i mediów ze strumieniowym SHA256',
  'restore dodaje dane do nowego profilu, zachowuje album/GPS i pliki po restarcie',
  'uszkodzenie, brak, traversal i konflikt nie zmieniają profilu',
  'odrzuca brakującą referencję zdjęcia, katalog docelowy w userData i obsługuje sparse 64MiB',
  'EEXIST nie usuwa istniejącego pliku docelowego',
  'hash i bytes skopiowanego pliku są zgodne dla 3KiB i 64MiB',
];

function run(args) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit' });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(['--import', environment, '--test', ...databaseTests]);

for (const scenario of backupScenarios) {
  const pattern = `^${scenario.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`;
  run(['--import', environment, '--test', '--test-name-pattern', pattern, backupTestFile]);
}
