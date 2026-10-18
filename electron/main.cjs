const { app, BrowserWindow, ipcMain, session, shell, protocol, dialog, net } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const { Readable } = require('node:stream');
const { mkdirSync, writeFileSync } = require('node:fs');
const { mkdtempSync } = require('node:fs');
const { tmpdir } = require('node:os');
const { LibraryDatabase } = require('./database.cjs');
const { OfflineMap } = require('./offline-map.cjs');
const { discoverRenderers } = require('./tv-discovery.cjs');
const { RemoteControl } = require('./remote-control.cjs');
const { BackupManager } = require('./backup-manager.cjs');
const { VideoLibrary } = require('./video-library.cjs');
const { existsSync, copyFileSync, renameSync, statSync } = require('node:fs');
protocol.registerSchemesAsPrivileged([
  { scheme: 'prezent-tiles', privileges: { standard: true, secure: true, supportFetchAPI: true } },
  { scheme: 'prezent-video', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);
if (process.argv.includes('--smoke-test')) {
  const profileArgument = process.argv.find(argument => argument.startsWith('--smoke-profile='));
  const profile = profileArgument ? path.resolve(profileArgument.slice('--smoke-profile='.length)) : mkdtempSync(path.join(tmpdir(), 'prezent-desktop-smoke-'));
  if (profileArgument && (path.dirname(profile).toLowerCase() !== path.resolve(tmpdir()).toLowerCase() || !path.basename(profile).startsWith('prezent-restart-test-'))) throw new Error('Nieprawidłowy profil testowy');
  mkdirSync(profile, { recursive: true });
  app.setPath('userData', profile);
}
const hasSingleInstanceLock = app.requestSingleInstanceLock();
if (!hasSingleInstanceLock) app.quit();
const page = pathToFileURL(path.join(__dirname, '../dist/index.html')).href;
let window;
if (hasSingleInstanceLock) app.on('second-instance', () => {
  if (!window || window.isDestroyed()) return;
  if (window.isMinimized()) window.restore();
  window.show();
  window.focus();
});
app.whenReady().then(async () => {
  if (!hasSingleInstanceLock) return;
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
  const videoLibrary = new VideoLibrary(path.join(app.getPath('userData'), 'library.sqlite'), path.join(app.getPath('userData'), 'videos'));
  const backupManager = new BackupManager(database, app.getPath('userData'), require('../package.json').version);
  const checkBackup = () => { try { backupManager.check(); } catch { if (!window?.isDestroyed()) window?.webContents.send('backup:error'); } };
  const backupTimer = setInterval(checkBackup, 6 * 60 * 60 * 1000);
  backupTimer.unref();
  app.once('will-quit', () => clearInterval(backupTimer));
  if (process.argv.includes('--smoke-test') && process.argv.includes('--recovery-smoke-test')) database.set('prezent_travel_photos_v2', JSON.stringify([{ id: 'synthetic-invalid-record' }]));
  if (offlineSmoke) database.set('prezent_app_settings_v2', JSON.stringify({ offlineSimulationMode: true }));
  if (process.argv.includes('--smoke-test') && process.argv.includes('--preferences-smoke-test')) {
    database.set('prezent_app_settings_v2', JSON.stringify({ ...JSON.parse(database.get('prezent_app_settings_v2') || '{}'), slideshowInterval: 12, kenBurnsEnabled: false, ambientSoundEnabled: false, showMiniMapPip: false, defaultSortBy: 'title', lazyLoadImages: false }));
  }
  let offlineNetworkBlocked = JSON.parse(database.get('prezent_app_settings_v2') || '{}').offlineSimulationMode === true;
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (_details, callback) => callback({ cancel: offlineNetworkBlocked }));
  app.once('will-quit', () => { videoLibrary.close(); database.close(); });
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
  const assertRenderer = event => {
    if (event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== page) throw new Error('Niedozwolony nadawca IPC');
  };
  protocol.handle('prezent-video', async request => {
    try {
      const url = new URL(request.url);
      if (url.hostname !== 'local' || !/^\/[a-z0-9-]+$/.test(url.pathname)) return new Response(null, { status: 400 });
      const file = videoLibrary.pathFor(url.pathname.slice(1));
      const size = statSync(file).size;
      const range = request.headers.get('range');
      let start = 0;
      let end = size - 1;
      let status = 200;
      if (range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(range);
        if (!match) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
        if (match[1]) start = Number(match[1]);
        if (match[2]) end = Number(match[2]);
        else if (match[1]) end = Math.min(start + 1024 * 1024 - 1, size - 1);
        if (start >= size || start > end) return new Response(null, { status: 416, headers: { 'Content-Range': `bytes */${size}` } });
        end = Math.min(end, size - 1);
        status = 206;
      }
      const contentType = path.extname(file).toLowerCase() === '.webm' ? 'video/webm' : 'video/mp4';
      const headers = { 'Accept-Ranges': 'bytes', 'Content-Length': String(end - start + 1), 'Content-Type': contentType };
      if (status === 206) headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
      return new Response(Readable.toWeb(require('node:fs').createReadStream(file, { start, end })), { status, headers });
    } catch { return new Response(null, { status: 404 }); }
  });
  ipcMain.handle('video:import', async event => {
    assertRenderer(event);
    const selected = await dialog.showOpenDialog(window, { properties: ['openFile', 'multiSelections'], filters: [{ name: 'Filmy MP4/WebM', extensions: ['mp4', 'webm'] }] });
    if (selected.canceled) return [];
    const results = [];
    for (const file of selected.filePaths) results.push(await videoLibrary.importVideo(file));
    return results.map(result => ({ ...result, item: { ...result.item, playbackUrl: `prezent-video://local/${result.item.id}` } }));
  });
  ipcMain.handle('video:list', event => { assertRenderer(event); return videoLibrary.list().map(item => ({ ...item, playbackUrl: `prezent-video://local/${item.id}` })); });
  ipcMain.handle('video:set-album', (event, id, albumId) => { assertRenderer(event); if (typeof id !== 'string' || (albumId !== null && typeof albumId !== 'string')) throw new Error('Nieprawidłowe medium lub album'); videoLibrary.setAlbum(id, albumId); return true; });
  ipcMain.handle('system:action', async (event, action, value) => {
    if (event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== page) throw new Error('Niedozwolony nadawca IPC');
    const photosPath = path.join(app.getPath('userData'), 'photos');
    if (action === 'info') return { photosPath, autoStart: app.getLoginItemSettings().openAtLogin, packaged: app.isPackaged, offlineMapAvailable: offlineMap !== null };
    if (action === 'remove-offline-map') {
      if (offlineMap) { offlineMap.close(); offlineMap = null; }
      let removedBytes = 0;
      if (existsSync(offlineFile)) { removedBytes = statSync(offlineFile).size; renameSync(offlineFile, `${offlineFile}.${Date.now()}.removed`); }
      return { removedBytes };
    }
    if (action === 'open-photos') {
      mkdirSync(photosPath, { recursive: true });
      const error = await shell.openPath(photosPath);
      if (error) throw new Error('Nie można otworzyć katalogu zdjęć');
      return true;
    }
    if (action === 'open-backups') {
      const directory = path.join(app.getPath('userData'), 'backups');
      mkdirSync(directory, { recursive: true });
      if (await shell.openPath(directory)) throw new Error('Nie można otworzyć kopii');
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
  if (!process.argv.includes('--smoke-test')) setTimeout(checkBackup, 2000).unref();
  if (process.argv.includes('--smoke-test')) {
    const reportsDirectory = path.join(process.cwd(), 'reports');
    mkdirSync(reportsDirectory, { recursive: true });
    writeFileSync(path.join(reportsDirectory, 'desktop-smoke.json'), JSON.stringify({ passed: false, status: 'RUNNING', date: new Date().toISOString() }));
    try {
      await window.webContents.executeJavaScript(`new Promise(resolve => { const started = Date.now(); const timer = setInterval(() => { if ((document.querySelectorAll('.leaflet-tile-loaded').length > 0 && document.body.innerText.includes('11')) || Date.now() - started > 10000) { clearInterval(timer); resolve(true); } }, 100); })`);
      const state = await window.webContents.executeJavaScript(`({ title: document.title, text: document.body.innerText.length, bridge: typeof window.electronAPI?.minimize, node: typeof window.require })`);
      state.invalidKeyRejected = await window.webContents.executeJavaScript(`(() => { try { window.electronAPI.storage.get('../invalid'); return false; } catch { return true; } })()`);
      const forgedEvent = { sender: window.webContents, senderFrame: { url: page } };
      ipcMain.emit('library:operation', forgedEvent, 'get', 'prezent_travel_photos_v2');
      state.invalidFrameRejected = forgedEvent.returnValue?.ok === false;
      state.popupDenied = await window.webContents.executeJavaScript(`window.open('https://example.com/') === null`);
      state.productionCsp = await window.webContents.executeJavaScript(`document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.content.includes("script-src 'self'") === true`);
      if (!state.invalidFrameRejected || !state.popupDenied || !state.productionCsp) throw new Error('Nieprawidłowe zabezpieczenia Electron/CSP');
      state.sqliteReadable = await window.webContents.executeJavaScript(`Array.isArray(JSON.parse(window.electronAPI.storage.get('prezent_travel_photos_v2')))`);
      if (process.argv.includes('--recovery-smoke-test')) {
        state.recoveryVisible = await window.webContents.executeJavaScript(`document.body.innerText.includes('Odczyt biblioteki wstrzymany')`);
        state.invalidDataPreserved = JSON.parse(database.get('prezent_travel_photos_v2'))[0]?.id === 'synthetic-invalid-record';
        if (!state.recoveryVisible || !state.invalidDataPreserved) throw new Error('Nieprawidłowy stan odzyskiwania');
      }
      if (process.argv.includes('--persistence-write')) {
        await window.webContents.executeJavaScript(`(() => { const photos = JSON.parse(window.electronAPI.storage.get('prezent_travel_photos_v2')); photos[0].notes = 'synthetic restart proof'; photos[0].url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='; window.electronAPI.storage.set('prezent_travel_photos_v2', JSON.stringify(photos)); })()`);
        state.persistenceWritten = true;
      }
      if (process.argv.includes('--persistence-read')) {
        state.persistenceAfterRestart = await window.webContents.executeJavaScript(`(() => { const photo = JSON.parse(window.electronAPI.storage.get('prezent_travel_photos_v2'))[0]; return photo.notes === 'synthetic restart proof' && photo.url === 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII='; })()`);
        if (!state.persistenceAfterRestart) throw new Error('Zdjęcie nie przetrwało restartu procesu');
      }
      if (offlineSmoke) {
        state.offlineTilesLoaded = await window.webContents.executeJavaScript(`Array.from(document.querySelectorAll('.leaflet-tile-loaded')).filter(image => image.src.startsWith('prezent-tiles:') && image.naturalWidth > 0).length`);
        if (!state.offlineTilesLoaded) throw new Error('Lokalne kafelki nie zostały wyrenderowane');
      }
      if (!state.invalidKeyRejected || !state.sqliteReadable) throw new Error('Nieprawidłowa integracja SQLite');
      if (state.text < 100 || state.bridge !== 'function' || state.node !== 'undefined') throw new Error('Nieprawidłowy renderer lub izolacja');
      if (process.argv.includes('--map-layers-smoke-test')) {
        state.mapLayers = [];
        for (const label of ['Nocny', 'Dzień', 'Kolor / Teren']) {
          await window.webContents.executeJavaScript(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === ${JSON.stringify(label)}).click()`);
          await new Promise(resolve => setTimeout(resolve, 300));
          const loaded = await window.webContents.executeJavaScript(`new Promise(resolve => { const started = Date.now(); const timer = setInterval(() => { const images = Array.from(document.querySelectorAll('.leaflet-tile-loaded')).filter(image => image.naturalWidth >= 256); if (images.length || Date.now() - started > 15000) { clearInterval(timer); resolve(images.length); } }, 100); })`);
          if (!loaded) throw new Error(`Nie załadowano kafelków: ${label}`);
          state.mapLayers.push({ label, loaded });
        }
      }
      if (process.argv.includes('--library-actions-smoke-test')) {
        const wait = async expression => window.webContents.executeJavaScript(`new Promise((resolve, reject) => { const start = Date.now(); const timer = setInterval(() => { if (${expression}) { clearInterval(timer); resolve(true); } else if (Date.now() - start > 6000) { clearInterval(timer); reject(new Error('Timeout testu biblioteki')); } }, 50); })`);
        await window.webContents.executeJavaScript(`document.querySelector('button[title="Wszystkie Zdjęcia & Galeria"]').click()`);
        await wait(`document.querySelector('input[aria-label^="Zaznacz zdjęcie:"]')`);
        const before = JSON.parse(database.get('prezent_travel_photos_v2')).length;
        await window.webContents.executeJavaScript(`document.querySelector('input[aria-label^="Zaznacz zdjęcie:"]').click()`);
        await wait(`Array.from(document.querySelectorAll('button')).some(button => button.textContent.includes('Usuń zaznaczone z biblioteki (1)') && !button.disabled)`);
        await window.webContents.executeJavaScript(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Usuń zaznaczone z biblioteki (1)')).click()`);
        await wait(`Array.from(document.querySelectorAll('button')).some(button => button.textContent.trim() === 'Usuń zdjęcia')`);
        await window.webContents.executeJavaScript(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Usuń zdjęcia').click()`);
        await wait(`JSON.parse(window.electronAPI.storage.get('prezent_travel_photos_v2')).length === ${before - 1}`);
        state.bulkDeletionPersisted = true;
        const albumId = JSON.parse(database.get('prezent_travel_albums_v2'))[0].id;
        const remaining = JSON.parse(database.get('prezent_travel_photos_v2')).length;
        await window.webContents.executeJavaScript(`document.querySelector('details').open = true; Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Usuń album, zachowaj zdjęcia').click()`);
        await wait(`Array.from(document.querySelectorAll('button')).some(button => button.textContent.trim() === 'Usuń album')`);
        await window.webContents.executeJavaScript(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.trim() === 'Usuń album').click()`);
        await wait(`!JSON.parse(window.electronAPI.storage.get('prezent_travel_albums_v2')).some(album => album.id === ${JSON.stringify(albumId)})`);
        const finalPhotos = JSON.parse(database.get('prezent_travel_photos_v2'));
        if (finalPhotos.length !== remaining || finalPhotos.some(photo => photo.albumId === albumId)) throw new Error('Nieprawidłowe usunięcie albumu');
        state.albumDeletedPhotosPreserved = true;
      }
      if (process.argv.includes('--remote-smoke-test')) {
        const waitFor = async expression => {
          try { return await window.webContents.executeJavaScript(`new Promise((resolve, reject) => { const started = Date.now(); const timer = setInterval(() => { if (${expression}) { clearInterval(timer); resolve(true); } else if (Date.now() - started > 6000) { clearInterval(timer); reject(new Error('Timeout testu pilota')); } }, 50); })`); }
          catch { throw new Error(`Niespełniony warunek runtime: ${expression.slice(0, 160)}`); }
        };
        if (process.argv.includes('--preferences-smoke-test')) {
          await window.webContents.executeJavaScript(`document.querySelector('button[title="Wszystkie Zdjęcia & Galeria"]').click()`);
          await waitFor(`Array.from(document.querySelectorAll('select')).some(select => select.value === 'title') && document.querySelector('img[loading="eager"]')`);
          state.galleryPreferencesApplied = true;
        }
        await window.webContents.executeJavaScript(`document.querySelector('button[title="Tryb TV / Salon 4K"]').click()`);
        await waitFor(`Array.from(document.querySelectorAll('button')).some(button => button.textContent.includes('Włącz pilota z telefonu'))`);
        await window.webContents.executeJavaScript(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Włącz pilota z telefonu')).click()`);
        await waitFor(`document.querySelector('input[aria-label="Adres parowania pilota"]')?.value`);
        const remoteUrl = new URL(await window.webContents.executeJavaScript(`document.querySelector('input[aria-label="Adres parowania pilota"]').value`));
        await waitFor(`document.querySelector('img[alt="Kod QR parowania pilota"]')?.complete`);
        await window.webContents.executeJavaScript(`Array.from(document.querySelectorAll('button')).find(button => button.textContent.includes('Rozpocznij prezentację na TV')).click()`);
        await waitFor(`document.querySelector('[data-testid="slideshow"] h2')`);
        const command = action => fetch(`http://127.0.0.1:${remoteUrl.port}/command`, { method: 'POST', headers: { Authorization: `Bearer ${remoteUrl.hash.slice(1)}` }, body: JSON.stringify({ command: action }) });
        if (!(await command('toggle-play')).ok) throw new Error('Polecenie pauzy odrzucone');
        await waitFor(`document.querySelector('button[title="Wznów (Spacja)"]')`);
        const previousTitle = await window.webContents.executeJavaScript(`document.querySelector('[data-testid="slideshow"] h2').textContent`);
        if (!(await command('next')).ok) throw new Error('Polecenie zmiany slajdu odrzucone');
        await waitFor(`document.querySelector('[data-testid="slideshow"] h2').textContent !== ${JSON.stringify(previousTitle)}`);
        state.remoteChangedSlide = true;
        state.remotePausedSlideshow = true;
        if (process.argv.includes('--preferences-smoke-test')) {
          state.slideshowPreferencesApplied = await window.webContents.executeJavaScript(`!!document.querySelector('select[title="Czas wyświetlania slajdu"] option[value="12"]:checked') && !document.querySelector('.animate-ken-burns') && !document.querySelector('[data-testid="slideshow-minimap"]') && !!document.querySelector('button[title="Włącz nastrojowy ambient dźwiękowy"]')`);
          if (!state.slideshowPreferencesApplied) throw new Error('Ustawienia pokazu nie zostały zastosowane');
        }
        await remoteControl.stop();
      }
      await new Promise(resolve => setTimeout(resolve, 1500));
      const screenshot = await window.webContents.capturePage();
      writeFileSync(path.join(reportsDirectory, 'desktop-smoke.png'), screenshot.toPNG());
      writeFileSync(path.join(reportsDirectory, 'desktop-smoke.json'), JSON.stringify({ ...state, passed: true, electron: process.versions.electron, packaged: app.isPackaged }, null, 2));
      app.exit(0);
    } catch (error) { writeFileSync(path.join(reportsDirectory, 'desktop-smoke.json'), JSON.stringify({ passed: false, error: error.message, date: new Date().toISOString() })); console.error(error); app.exit(1); }
  }
}).catch(() => {
  if (process.argv.includes('--smoke-test')) {
    const reportsDirectory = path.join(process.cwd(), 'reports'); mkdirSync(reportsDirectory, { recursive: true });
    writeFileSync(path.join(reportsDirectory, 'desktop-smoke.json'), JSON.stringify({ passed: false, error: 'Nie udało się uruchomić aplikacji' }));
  } else dialog.showErrorBox('Nie udało się uruchomić Prezent Mapy', `Zachowaj kopię folderu danych przed przywracaniem biblioteki:\n${app.getPath('userData')}`);
  app.exit(1);
});
app.on('window-all-closed', () => app.quit());
