const { contextBridge, ipcRenderer } = require('electron');

// Expose a safe API to the main window renderer
contextBridge.exposeInMainWorld('electronAPI', {
  // Timer controls
  startTimer: () => ipcRenderer.send('timer-control', 'start'),
  pauseTimer: () => ipcRenderer.send('timer-control', 'pause'),
  stopTimer: () => ipcRenderer.send('timer-control', 'stop'),
  resetTimer: () => ipcRenderer.send('timer-control', 'reset'),
  
  // Window controls
  minimizeTimer: () => ipcRenderer.send('minimize-timer'),
  restoreTimer: () => ipcRenderer.send('timer-control', 'restore'),
  
  // Timer state updates
  onTimerUpdate: (callback) => {
    ipcRenderer.on('timer-update', (_, timeLeft, isRunning, isWorkPhase) => {
      callback(timeLeft, isRunning, isWorkPhase);
    });
  },

  // Listen for restore event
  onRestore: (callback) => {
    ipcRenderer.on('restore-timer', callback);
  }
}); 