import { mkdirSync } from 'node:fs';
import path from 'node:path';
// Project-scoped test profiles avoid filling the Windows system TEMP volume.
// This modifies only the current test process and its children, never Windows.
const directory = path.resolve('.test-tools', 'tmp');
mkdirSync(directory, { recursive: true });
process.env.TEMP = directory;
process.env.TMP = directory;
const electronCache = path.resolve('.test-tools', 'electron-cache');
mkdirSync(electronCache, { recursive: true });
process.env.ELECTRON_CACHE = electronCache;
