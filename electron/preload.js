
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  checkBluetoothAvailable: () => ipcRenderer.invoke('bluetooth-available'),
  platform: process.platform,
  isElectron: true
});
