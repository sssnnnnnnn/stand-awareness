const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    // Menu actions
    onMenuAction: (callback) => {
        ipcRenderer.on('menu-new-entry', callback);
        ipcRenderer.on('menu-save-entry', callback);
        ipcRenderer.on('menu-export', callback);
        ipcRenderer.on('menu-view-today', callback);
        ipcRenderer.on('menu-view-history', callback);
    },
    
    // Remove menu listeners
    removeMenuListeners: () => {
        ipcRenderer.removeAllListeners('menu-new-entry');
        ipcRenderer.removeAllListeners('menu-save-entry');
        ipcRenderer.removeAllListeners('menu-export');
        ipcRenderer.removeAllListeners('menu-view-today');
        ipcRenderer.removeAllListeners('menu-view-history');
    },
    
    // App info
    platform: process.platform,
    
    // Utility functions
    isElectron: true
});