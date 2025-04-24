const { contextBridge, ipcRenderer } = require('electron');

// Exponer funciones seguras al renderer
contextBridge.exposeInMainWorld('electronAPI', {
    sendMessage: (message) => ipcRenderer.send('message', message),
    getBaseFolderPath: () => ipcRenderer.invoke('get-base-folder-path'),
    selectFolder: () => ipcRenderer.invoke('select-parent-folder'),
    createFolder: (folderName) => ipcRenderer.invoke('create-folder', folderName),
    listFolders: () => ipcRenderer.invoke('list-folders'),
    listFiles: (folderPath) => ipcRenderer.invoke('list-files', folderPath),
    readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
    writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
    createFile: (folderPath, fileName) => ipcRenderer.invoke('create-file', folderPath, fileName),
    deleteFile: (folderPath) => ipcRenderer.invoke('delete-file', folderPath),
    deleteFolder: (folderPath) => ipcRenderer.invoke('delete-folder', folderPath),
    renameFile: (oldFilePath, newFilePath) => ipcRenderer.invoke('rename-file', oldFilePath, newFilePath),
    renameFolder: (baseFolderPath, oldFolderPath, newFolderName) => ipcRenderer.invoke('rename-folder', baseFolderPath, oldFolderPath, newFolderName),
});