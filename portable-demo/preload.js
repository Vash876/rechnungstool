// Preload-Skript für Electron
// Dieses Skript läuft im Renderer-Prozess vor dem Web-Content

const { contextBridge, ipcRenderer } = require('electron');

// Sichere API für den Renderer-Prozess
contextBridge.exposeInMainWorld('electronAPI', {
  // Plattform-Informationen
  platform: process.platform,
  
  // App-Informationen
  getVersion: () => {
    return process.env.npm_package_version || '1.0.0';
  },
  
  // Logging für Debugging
  log: (message) => {
    console.log('Renderer:', message);
  },
  
  // Ist Electron-App?
  isElectron: true
});

// Zeige an, dass wir in Electron laufen
window.addEventListener('DOMContentLoaded', () => {
  console.log('🖥️ Läuft in Electron Desktop App');
});

console.log('📋 Preload-Skript geladen');
