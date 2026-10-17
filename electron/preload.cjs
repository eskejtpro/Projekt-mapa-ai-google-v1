const { contextBridge, ipcRenderer } = require('electron');
function storageCall(operation, ...args) {
  const result = ipcRenderer.sendSync('library:operation', operation, ...args);
  if (!result?.ok) throw new Error(result?.error || 'Błąd lokalnej bazy');
  return result.value;
}
contextBridge.exposeInMainWorld('electronAPI', Object.freeze({
  minimize: () => ipcRenderer.invoke('window:action', 'minimize'),
  maximize: () => ipcRenderer.invoke('window:action', 'maximize'),
  close: () => ipcRenderer.invoke('window:action', 'close'),
  systemInfo: () => ipcRenderer.invoke('system:action', 'info'),
  openPhotos: () => ipcRenderer.invoke('system:action', 'open-photos'),
  setAutoStart: enabled => ipcRenderer.invoke('system:action', 'autostart', enabled),
  importOfflineMap: () => ipcRenderer.invoke('maps:import'),
  removeOfflineMap: () => ipcRenderer.invoke('system:action', 'remove-offline-map'),
  discoverTVs: () => ipcRenderer.invoke('tv:discover'),
  storage: Object.freeze({
    get: key => storageCall('get', key),
    set: (key, value) => storageCall('set', key, value),
    batch: entries => storageCall('batch', entries),
  }),
}));
