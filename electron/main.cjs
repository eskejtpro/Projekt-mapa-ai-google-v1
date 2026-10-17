const { app, BrowserWindow, ipcMain, session } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { mkdirSync, writeFileSync } = require('node:fs');
const { mkdtempSync } = require('node:fs');
const { tmpdir } = require('node:os');
if (process.argv.includes('--smoke-test')) app.setPath('userData', mkdtempSync(path.join(tmpdir(), 'prezent-desktop-smoke-')));
const page = pathToFileURL(path.join(__dirname, '../dist/index.html')).href;
let window;
app.whenReady().then(async () => {
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  window = new BrowserWindow({
    width: 1440, height: 900, minWidth: 960, minHeight: 640,
    frame: false, backgroundColor: '#080d17', show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false, webSecurity: true },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  window.webContents.on('will-navigate', (event, url) => { if (url !== page) event.preventDefault(); });
  ipcMain.handle('window:action', (event, action) => {
    if (event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== page) throw new Error('Niedozwolony nadawca IPC');
    if (!['minimize', 'maximize', 'close'].includes(action)) throw new Error('Nieznana akcja okna');
    if (action === 'minimize') window.minimize();
    if (action === 'maximize') window.isMaximized() ? window.unmaximize() : window.maximize();
    if (action === 'close') window.close();
    return true;
  });
  window.once('ready-to-show', () => window.show());
  await window.loadURL(page);
  if (process.argv.includes('--smoke-test')) {
    try {
      await window.webContents.executeJavaScript(`new Promise(resolve => { const started = Date.now(); const timer = setInterval(() => { if ((document.querySelectorAll('.leaflet-tile-loaded').length > 0 && document.body.innerText.includes('11')) || Date.now() - started > 10000) { clearInterval(timer); resolve(true); } }, 100); })`);
      const state = await window.webContents.executeJavaScript(`({ title: document.title, text: document.body.innerText.length, bridge: typeof window.electronAPI?.minimize, node: typeof window.require })`);
      if (state.text < 100 || state.bridge !== 'function' || state.node !== 'undefined') throw new Error('Nieprawidłowy renderer lub izolacja');
      mkdirSync(path.join(__dirname, '../reports'), { recursive: true });
      await new Promise(resolve => setTimeout(resolve, 1500));
      const screenshot = await window.webContents.capturePage();
      writeFileSync(path.join(__dirname, '../reports/desktop-smoke.png'), screenshot.toPNG());
      writeFileSync(path.join(__dirname, '../reports/desktop-smoke.json'), JSON.stringify({ ...state, passed: true, electron: process.versions.electron }, null, 2));
      app.exit(0);
    } catch (error) { console.error(error); app.exit(1); }
  }
});
app.on('window-all-closed', () => app.quit());
