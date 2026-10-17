const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('electronAPI', Object.freeze({
  minimize: () => ipcRenderer.invoke('window:action', 'minimize'),
  maximize: () => ipcRenderer.invoke('window:action', 'maximize'),
  close: () => ipcRenderer.invoke('window:action', 'close'),
}));
