const { app, BrowserWindow, ipcMain, session, shell, protocol, dialog } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { mkdirSync, writeFileSync } = require('node:fs');
const { mkdtempSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { LibraryDatabase } = require('./database.cjs');
const { OfflineMap } = require('./offline-map.cjs');
const { discoverRenderers } = require('./tv-discovery.cjs');
const { RemoteControl } = require('./remote-control.cjs');
const { existsSync, copyFileSync, renameSync, statSync } = require('node:fs');
protocol.registerSchemesAsPrivileged([{ scheme: 'prezent-tiles', privileges: { standard: true, secure: true, supportFetchAPI: true } }]);
if (process.argv.includes('--smoke-test')) app.setPath('userData', mkdtempSync(path.join(tmpdir(), 'prezent-desktop-smoke-')));
const page = pathToFileURL(path.join(__dirname, '../dist/index.html')).href;
let window;
app.whenReady().then(async () => {
  const offlineFile = path.join(app.getPath('userData'), 'offline.mbtiles');
  const offlineSmoke = process.argv.includes('--smoke-test') && process.argv.includes('--offline-smoke-test');
  if (offlineSmoke) {
    const { DatabaseSync } = require('node:sqlite');
    const fixture = new DatabaseSync(offlineFile);
    fixture.exec("CREATE TABLE metadata(name TEXT,value TEXT); INSERT INTO metadata VALUES('format','png'); CREATE TABLE tiles(zoom_level INTEGER,tile_column INTEGER,tile_row INTEGER,tile_data BLOB);");
    const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
    const insert = fixture.prepare('INSERT INTO tiles VALUES(?,?,?,?)');
    for (let x = 0; x < 8; x++) for (let y = 0; y < 8; y++) insert.run(3, x, y, image);
    fixture.close();
  }
  let offlineMap = null;
  try { if (existsSync(offlineFile)) offlineMap = new OfflineMap(offlineFile); } catch { console.error('Lokalny pakiet map jest uszkodzony; zaimportuj go ponownie.'); }
  protocol.handle('prezent-tiles', request => {
    try {
      const url = new URL(request.url);
      const match = /^\/(\d+)\/(\d+)\/(\d+)$/.exec(url.pathname);
      if (url.hostname !== 'local' || !match || !offlineMap) return new Response(null, { status: 404 });
      const bytes = offlineMap.tile(...match.slice(1).map(Number));
      if (!bytes) return new Response(null, { status: 404 });
      const format = offlineMap.metadata.format;
      return new Response(bytes, { headers: { 'Content-Type': `image/${format === 'jpg' ? 'jpeg' : format}`, 'Access-Control-Allow-Origin': '*' } });
    } catch { return new Response(null, { status: 400 }); }
  });
  const database = new LibraryDatabase(path.join(app.getPath('userData'), 'library.sqlite'));
  if (offlineSmoke) database.set('prezent_app_settings_v2', JSON.stringify({ offlineSimulationMode: true }));
  let offlineNetworkBlocked = JSON.parse(database.get('prezent_app_settings_v2') || '{}').offlineSimulationMode === true;
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (_details, callback) => callback({ cancel: offlineNetworkBlocked }));
  app.once('will-quit', () => database.close());
  session.defaultSession.setPermissionRequestHandler((_contents, _permission, callback) => callback(false));
  window = new BrowserWindow({
    width: 1440, height: 900, minWidth: 960, minHeight: 640,
    frame: false, backgroundColor: '#080d17', show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false, webSecurity: true },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  const remoteControl = new RemoteControl(command => {
    if (!window.isDestroyed()) window.webContents.send('remote:command', command);
  });
  window.once('closed', () => { void remoteControl.stop(); });
  ipcMain.handle('remote:session', (event, action) => {
    if (event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== page) throw new Error('Niedozwolony nadawca IPC');
    if (action === 'start') return remoteControl.start();
    if (action === 'stop') return remoteControl.stop();
    throw new Error('Nieznana operacja pilota');
  });
  let pendingDiscovery = null;
  ipcMain.handle('tv:discover', event => {
    if (event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== page) throw new Error('Niedozwolony nadawca IPC');
    if (!pendingDiscovery) pendingDiscovery = discoverRenderers().finally(() => { pendingDiscovery = null; });
    return pendingDiscovery;
  });
  ipcMain.handle('maps:import', async event => {
    if (event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== page) throw new Error('Niedozwolony nadawca IPC');
    const selected = await dialog.showOpenDialog(window, { properties: ['openFile'], filters: [{ name: 'Raster MBTiles', extensions: ['mbtiles'] }] });
    if (selected.canceled) return null;
    const candidate = new OfflineMap(selected.filePaths[0]);
    const metadata = { ...candidate.metadata };
    candidate.close();
    const staging = path.join(app.getPath('userData'), `offline-${Date.now()}.mbtiles`);
    copyFileSync(selected.filePaths[0], staging);
    const check = new OfflineMap(staging); check.close();
    if (offlineMap) { offlineMap.close(); offlineMap = null; }
    if (existsSync(offlineFile)) renameSync(offlineFile, `${offlineFile}.${Date.now()}.backup`);
    renameSync(staging, offlineFile);
    offlineMap = new OfflineMap(offlineFile);
    return { name: metadata.name || 'Lokalny pakiet MBTiles', sizeMb: statSync(offlineFile).size / 1048576 };
  });
  ipcMain.handle('system:action', async (event, action, value) => {
    if (event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== page) throw new Error('Niedozwolony nadawca IPC');
    const photosPath = path.join(app.getPath('userData'), 'photos');
    if (action === 'info') return { photosPath, autoStart: app.getLoginItemSettings().openAtLogin, packaged: app.isPackaged, offlineMapAvailable: offlineMap !== null };
    if (action === 'remove-offline-map') {
      if (offlineMap) { offlineMap.close(); offlineMap = null; }
      if (existsSync(offlineFile)) renameSync(offlineFile, `${offlineFile}.${Date.now()}.removed`);
      return true;
    }
    if (action === 'open-photos') {
      mkdirSync(photosPath, { recursive: true });
      const error = await shell.openPath(photosPath);
      if (error) throw new Error('Nie można otworzyć katalogu zdjęć');
      return true;
    }
    if (action === 'autostart' && typeof value === 'boolean') {
      if (!app.isPackaged) throw new Error('Autostart jest dostępny w zainstalowanej aplikacji');
      app.setLoginItemSettings({ openAtLogin: value });
      if (app.getLoginItemSettings().openAtLogin !== value) throw new Error('Windows nie potwierdził autostartu');
      return true;
    }
    throw new Error('Nieznana operacja systemowa');
  });
  ipcMain.on('library:operation', (event, operation, key, value) => {
    try {
      if (event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== page) throw new Error('Niedozwolony nadawca IPC');
      if (!['get', 'set', 'batch'].includes(operation)) throw new Error('Nieznana operacja');
      const result = operation === 'get' ? database.get(key) : operation === 'set' ? database.set(key, value) : database.batch(key);
      if (operation !== 'get') offlineNetworkBlocked = JSON.parse(database.get('prezent_app_settings_v2') || '{}').offlineSimulationMode === true;
      event.returnValue = { ok: true, value: result ?? null };
    } catch (error) { event.returnValue = { ok: false, error: error.message }; }
  });
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
      state.invalidKeyRejected = await window.webContents.executeJavaScript(`(() => { try { window.electronAPI.storage.get('../invalid'); return false; } catch { return true; } })()`);
      state.sqliteReadable = await window.webContents.executeJavaScript(`Array.isArray(JSON.parse(window.electronAPI.storage.get('prezent_travel_photos_v2')))`);
      if (offlineSmoke) {
        state.offlineTilesLoaded = await window.webContents.executeJavaScript(`Array.from(document.querySelectorAll('.leaflet-tile-loaded')).filter(image => image.src.startsWith('prezent-tiles:') && image.naturalWidth > 0).length`);
        if (!state.offlineTilesLoaded) throw new Error('Lokalne kafelki nie zostały wyrenderowane');
      }
      if (!state.invalidKeyRejected || !state.sqliteReadable) throw new Error('Nieprawidłowa integracja SQLite');
      if (state.text < 100 || state.bridge !== 'function' || state.node !== 'undefined') throw new Error('Nieprawidłowy renderer lub izolacja');
      if (process.argv.includes('--remote-smoke-test')) {
        const waitFor = expression => window.webContents.executeJavaScript(`new Promise((resolve, reject) => { const started = Date.now(); const timer = setInterval(() => { if (${expression}) { clearInterval(timer); resolve(true); } else if (Date.now() - started > 6000) { clearInterval(timer); reject(new Error('Timeout testu pilota')); } }, 50); })`);
        await window.webContents.executeJavaScript(`document.querySelector('button[title="Tryb TV / Salon 4K"]').click()`);
        await waitFor(`Array.from(document.querySelectorAll('button')).some(button => button.textContent.includes('Włącz pilota z telefonu'))`);
        await window.webContents.executeJavaScript(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Włącz pilota z telefonu')).click()`);
        await waitFor(`document.querySelector('input[aria-label="Adres parowania pilota"]')?.value`);
        const remoteUrl = new URL(await window.webContents.executeJavaScript(`document.querySelector('input[aria-label="Adres parowania pilota"]').value`));
        await waitFor(`document.querySelector('img[alt="Kod QR parowania pilota"]')?.complete`);
        await window.webContents.executeJavaScript(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Rozpocznij prezentację na TV')).click()`);
        await waitFor(`document.querySelector('h2')`);
        const command = action => fetch(`http://127.0.0.1:${remoteUrl.port}/command`, { method: 'POST', headers: { Authorization: `Bearer ${remoteUrl.hash.slice(1)}` }, body: JSON.stringify({ command: action }) });
        if (!(await command('toggle-play')).ok) throw new Error('Polecenie pauzy odrzucone');
        await waitFor(`document.querySelector('button[title="Wznów (Spacja)"]')`);
        const previousTitle = await window.webContents.executeJavaScript(`document.querySelector('h2').textContent`);
        if (!(await command('next')).ok) throw new Error('Polecenie zmiany slajdu odrzucone');
        await waitFor(`document.querySelector('h2').textContent !== ${JSON.stringify(previousTitle)}`);
        state.remoteChangedSlide = true;
        state.remotePausedSlideshow = true;
        await remoteControl.stop();
      }
      const reportsDirectory = path.join(process.cwd(), 'reports');
      mkdirSync(reportsDirectory, { recursive: true });
      await new Promise(resolve => setTimeout(resolve, 1500));
      const screenshot = await window.webContents.capturePage();
      writeFileSync(path.join(reportsDirectory, 'desktop-smoke.png'), screenshot.toPNG());
      writeFileSync(path.join(reportsDirectory, 'desktop-smoke.json'), JSON.stringify({ ...state, passed: true, electron: process.versions.electron, packaged: app.isPackaged }, null, 2));
      app.exit(0);
    } catch (error) { console.error(error); app.exit(1); }
  }
});
app.on('window-all-closed', () => app.quit());
