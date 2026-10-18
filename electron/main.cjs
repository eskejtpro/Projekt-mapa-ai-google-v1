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
const { hydrateRenderer, DlnaCasting } = require('./tv-casting.cjs');
const { BackupManager } = require('./backup-manager.cjs');
const { VideoLibrary } = require('./video-library.cjs');
const { createLibraryBackup, restoreLibraryBackup } = require('./library-backup.cjs');
const { existsSync, copyFileSync, renameSync, statSync } = require('node:fs');
protocol.registerSchemesAsPrivileged([
  { scheme: 'prezent-tiles', privileges: { standard: true, secure: true, supportFetchAPI: true } },
  { scheme: 'prezent-video', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true, corsEnabled: true } },
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
  if (offlineSmoke && !existsSync(offlineFile)) {
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
  let backupBusy = false;
  const backupManager = new BackupManager(database, app.getPath('userData'), require('../package.json').version);
  const checkBackup = () => { try { backupManager.check(); } catch { if (!window?.isDestroyed()) window?.webContents.send('backup:error'); } };
  const backupTimer = setInterval(checkBackup, 6 * 60 * 60 * 1000);
  backupTimer.unref();
  app.once('will-quit', () => clearInterval(backupTimer));
  if (process.argv.includes('--smoke-test') && process.argv.includes('--recovery-smoke-test')) database.set('prezent_travel_photos_v2', JSON.stringify([{ id: 'synthetic-invalid-record' }]));
  if (offlineSmoke) database.set('prezent_app_settings_v2', JSON.stringify({ ...JSON.parse(database.get('prezent_app_settings_v2') || '{}'), offlineSimulationMode: true }));
  if (process.argv.includes('--smoke-test') && process.argv.includes('--preferences-smoke-test')) {
    database.set('prezent_app_settings_v2', JSON.stringify({ ...JSON.parse(database.get('prezent_app_settings_v2') || '{}'), slideshowInterval: 12, kenBurnsEnabled: false, ambientSoundEnabled: false, showMiniMapPip: false, defaultSortBy: 'title', lazyLoadImages: false }));
  }
  let offlineNetworkBlocked = JSON.parse(database.get('prezent_app_settings_v2') || '{}').offlineSimulationMode === true;
  session.defaultSession.webRequest.onBeforeRequest({ urls: ['http://*/*', 'https://*/*'] }, (_details, callback) => callback({ cancel: offlineNetworkBlocked }));
  app.once('will-quit', () => { videoLibrary.close(); database.close(); });
  session.defaultSession.setPermissionRequestHandler((contents, permission, callback, details) => {
    callback(permission === 'fullscreen' && contents === window?.webContents && details.isMainFrame === true && details.requestingUrl === page);
  });
  window = new BrowserWindow({
    width: 1440, height: 900, minWidth: 960, minHeight: 640,
    frame: false, backgroundColor: '#080d17', show: false,
    webPreferences: { preload: path.join(__dirname, 'preload.cjs'), contextIsolation: true, sandbox: true, nodeIntegration: false, webSecurity: true },
  });
  window.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
  const resolveCastMedia = async media => {
    if (media.kind === 'video') {
      const item = videoLibrary.list().find(candidate => candidate.id === media.id);
      if (!item) throw new Error('Nieznany film');
      return { file: videoLibrary.pathFor(item.id), mimeType: item.mimeType, title: item.title };
    }
    return database.pathForPhoto(media.id);
  };
  const casting = new DlnaCasting(resolveCastMedia, [path.join(app.getPath('userData'), 'videos'), path.join(app.getPath('userData'), 'photos')]);
  window.once('closed', () => { void casting.disconnect(); });
  let pendingDiscovery = null;
  ipcMain.handle('tv:discover', event => {
    if (event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== page) throw new Error('Niedozwolony nadawca IPC');
    if (!pendingDiscovery) pendingDiscovery = discoverRenderers().then(async devices => { const hydrated = await Promise.allSettled(devices.map(hydrateRenderer)); const result = hydrated.map((item, index) => item.status === 'fulfilled' ? item.value : { ...devices[index], capabilities: ['discovery'], error: item.reason?.message || 'Nie udało się odczytać usług DLNA' }); casting.setDevices(result); return result; }).finally(() => { pendingDiscovery = null; });
    return pendingDiscovery;
  });
  ipcMain.handle('tv:connect', async (event, deviceId) => { assertRenderer(event); if (typeof deviceId !== 'string' || deviceId.length > 300) throw new Error('Nieprawidłowy odbiornik'); return casting.connect(deviceId); });
  ipcMain.handle('tv:play', async (event, media) => { assertRenderer(event); if (!media || !['photo', 'video'].includes(media.kind) || typeof media.id !== 'string') throw new Error('Nieprawidłowe medium'); return casting.play(media); });
  ipcMain.handle('tv:slideshow', async (event, items) => { assertRenderer(event); if (!Array.isArray(items) || items.length > 500 || items.some(item => !item || !['photo', 'video'].includes(item.kind) || typeof item.id !== 'string')) throw new Error('Nieprawidłowy pokaz'); await casting.slideshow(items); return true; });
  ipcMain.handle('tv:control', async (event, action) => { assertRenderer(event); return casting.control(action); });
  ipcMain.handle('tv:disconnect', async event => { assertRenderer(event); await casting.disconnect(); return true; });
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
  protocol.handle('prezent-video', request => require('./video-response.cjs').videoResponse(videoLibrary, request));
  ipcMain.handle('video:import', async event => {
    assertRenderer(event);
    const e2eImport = process.argv.includes('--smoke-test') && process.argv.includes('--e2e-interactive');
    const selected = e2eImport && process.env.PREZENT_E2E_VIDEO_FIXTURE
      ? { canceled: false, filePaths: [path.resolve(process.env.PREZENT_E2E_VIDEO_FIXTURE)] }
      : await dialog.showOpenDialog(window, { properties: ['openFile', 'multiSelections'], filters: [{ name: 'Filmy MP4/WebM', extensions: ['mp4', 'webm'] }] });
    if (selected.canceled) return [];
    const results = [];
    for (const file of selected.filePaths) {
      const testLocation = e2eImport && process.env.PREZENT_E2E_VIDEO_LOCATION ? JSON.parse(process.env.PREZENT_E2E_VIDEO_LOCATION) : undefined;
      results.push(await videoLibrary.importVideo(file, testLocation ? { location: testLocation, locationSource: 'metadata' } : {}));
    }
    return results.map(result => ({ ...result, item: { ...result.item, playbackUrl: `prezent-video://local/${result.item.id}` } }));
  });
  ipcMain.handle('backup:library', async (event, operation) => {
    assertRenderer(event);
    if (!['create', 'restore'].includes(operation) || backupBusy) throw new Error('Kopia jest w toku lub operacja jest nieprawidłowa');
    backupBusy = true;
    try {
      const selected = await dialog.showOpenDialog(window, { title: operation === 'create' ? 'Wybierz folder nadrzędny dla pełnej kopii' : 'Wybierz folder pełnej kopii z manifest.json', properties: ['openDirectory'] });
      if (selected.canceled) return null;
      const directory = selected.filePaths[0];
      if (operation === 'create') {
        const destination = path.join(directory, `Prezent-Mapy-${Date.now()}-${require('node:crypto').randomUUID()}`);
        await createLibraryBackup(database, app.getPath('userData'), destination);
        return { directory: destination };
      }
      const confirmation = await dialog.showMessageBox(window, { type: 'question', buttons: ['Anuluj', 'Przywróć'], defaultId: 0, cancelId: 0, message: 'Dodać dane z pełnej kopii?', detail: 'Istniejące dane zostaną zachowane. Konflikty lub uszkodzone pliki zatrzymają przywracanie. Najpierw powstanie kopia aktualnej biblioteki.' });
      if (confirmation.response !== 1) return null;
      const safety = path.join(app.getPath('userData'), 'backups', `before-restore-${Date.now()}-${require('node:crypto').randomUUID()}`);
      await createLibraryBackup(database, app.getPath('userData'), safety);
      await restoreLibraryBackup(database, videoLibrary, directory);
      return { directory, safety };
    } finally { backupBusy = false; }
  });
  ipcMain.handle('video:list', event => { assertRenderer(event); return videoLibrary.list().map(item => ({ ...item, playbackUrl: `prezent-video://local/${item.id}` })); });
  ipcMain.handle('video:set-album', (event, id, albumId) => { assertRenderer(event); if (typeof id !== 'string' || (albumId !== null && typeof albumId !== 'string')) throw new Error('Nieprawidłowe medium lub album'); videoLibrary.setAlbum(id, albumId); return true; });
  ipcMain.handle('video:set-location', (event, id, location, source = 'user') => { assertRenderer(event); if (typeof id !== 'string' || (location !== null && (typeof location !== 'object' || !['user', 'place'].includes(source)))) throw new Error('Nieprawidłowa lokalizacja'); videoLibrary.setLocation(id, location, source); return true; });
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
  if (process.argv.includes('--smoke-test') && !process.argv.includes('--e2e-interactive')) {
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
      if (process.argv.includes('--tv-smoke-test')) {
        const waitFor = async expression => {
          try { return await window.webContents.executeJavaScript(`new Promise((resolve, reject) => { const started = Date.now(); const timer = setInterval(() => { if (${expression}) { clearInterval(timer); resolve(true); } else if (Date.now() - started > 6000) { clearInterval(timer); reject(new Error('Timeout testu TV')); } }, 50); })`); }
          catch { throw new Error(`Niespełniony warunek runtime: ${expression.slice(0, 160)}`); }
        };
        if (process.argv.includes('--preferences-smoke-test')) {
          await window.webContents.executeJavaScript(`document.querySelector('button[title="Wszystkie Zdjęcia & Galeria"]').click()`);
          await waitFor(`Array.from(document.querySelectorAll('select')).some(select => select.value === 'title') && document.querySelector('img[loading="eager"]')`);
          state.galleryPreferencesApplied = true;
        }
        await window.webContents.executeJavaScript(`document.querySelector('button[title="Tryb TV / Salon 4K"]').click()`);
        await waitFor(`Array.from(document.querySelectorAll('button')).some(button => button.textContent.includes('Odśwież'))`);
        state.tvPanelOpened = true;
        if (process.argv.includes('--preferences-smoke-test')) {
          state.slideshowPreferencesApplied = await window.webContents.executeJavaScript(`!!document.querySelector('select[title="Czas wyświetlania slajdu"] option[value="12"]:checked') && !document.querySelector('.animate-ken-burns') && !document.querySelector('[data-testid="slideshow-minimap"]') && !!document.querySelector('button[title="Włącz nastrojowy ambient dźwiękowy"]')`);
          if (!state.slideshowPreferencesApplied) throw new Error('Ustawienia pokazu nie zostały zastosowane');
        }
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
