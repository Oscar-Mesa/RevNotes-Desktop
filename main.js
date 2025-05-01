const { app, BrowserWindow, ipcMain, dialog, ipcRenderer  } = require('electron');
const path = require('path');
const fs = require('fs');


// Definir la carpeta principal donde se crearán todas las demás carpetas
const baseFolderPath = path.join(app.getPath('documents'), 'RevNotes', 'RevNotes-Folders');



let mainWindow;

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 860,
        minWidth: 550,
        minHeight: 700,
        icon: path.join(__dirname, 'src', 'img', 'RevNotes-Logo_sin-fondo_.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'src', 'preload.js'),
            nodeIntegration: false,
            devTools: false,
            contextIsolation: true,
        },
    });

    mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'))

    // 🔥 Esto remueve la barra de menú
    // mainWindow.removeMenu();
    mainWindow.setMenuBarVisibility(false);
});

// Asegurarse de que la carpeta principal exista
if (!fs.existsSync(baseFolderPath)) {
    fs.mkdirSync(baseFolderPath, { recursive: true });
}

// console.log('Ruta base configurada:', baseFolderPath);

ipcMain.on('set-always-on-top', (event, isOn) => {
    const win = BrowserWindow.getAllWindows()[0]; // O guarda tu ventana principal en una variable
    if (win) {
      win.setAlwaysOnTop(isOn);
    }
  });

ipcMain.handle('create-folder', async (event, folderName) => {
    const newFolderPath = path.join(baseFolderPath, folderName);
    if (!fs.existsSync(newFolderPath)) {
        fs.mkdirSync(newFolderPath);
        return true;
    }
    return false;
});

// Manejar la lectura de carpetas dentro de la carpeta principal
ipcMain.handle('list-folders', async () => {
    try {
        const items = fs.readdirSync(baseFolderPath);
        // console.log(baseFolderPath);
        const folders = items.filter(item => {
        const itemPath = path.join(baseFolderPath, item);
        return fs.statSync(itemPath).isDirectory();  // Filtrar solo las carpetas
      });
      return folders;
    } catch (error) {
      console.error('Error al leer las carpetas:', error);
      return [];
    }
});
  

ipcMain.handle('list-files', async (event, folderPath) => {
    if (!folderPath || typeof folderPath !== 'string') {
        // console.log('No se proporcionó una ruta válida para la carpeta.')
        throw new Error('No se proporcionó una ruta válida para la carpeta.');
    }
    try {
        return fs.readdirSync(folderPath).filter(file => file.endsWith('.txt'));
    } catch (error) {
        console.error('Error al leer los archivos:', error);
        throw error;
    }
});

ipcMain.handle('read-file', async (event, filePath) => {
    try {
        const content = fs.readFileSync(filePath, 'utf-8');
        // console.log("El backend recibió path para leer:", filePath);
        return content;
    } catch (error) {
        console.error('Error al leer el archivo:', error);
        throw error;
    }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
    try {
        fs.writeFileSync(filePath, content, 'utf8');
        return true;
    } catch (error) {
        console.error('Error al guardar el archivo:', error);
        return false;
    }
});

ipcMain.handle('create-file', async (event, folderPath, fileName) => {
    try {
        
        let fileNumber = 0;
        let nombreNota = `${fileName}`;
        let filePath = `${folderPath}/${fileName}.txt`;

        
        if (!fs.existsSync(filePath)) {
            // console.log('fileNumber:' + fileNumber)
            fs.writeFileSync(filePath, '', 'utf8'); // Crear archivo vacío
            return true;
        } else {

            while (fs.existsSync(filePath)) {
                fileNumber++;
                nombreNota = `${fileName}${fileNumber}`;
                filePath = `${folderPath}/${nombreNota}.txt`;
            }
            
            // console.log('fileNumber existe:' + fileNumber)
            // console.log(' nota actualizada', fileName)
            fs.writeFileSync(filePath, '', 'utf8');
            return true;
        }
    } catch (error) {
        console.error('Error al crear el archivo:', error);
        return false;
    }
});

ipcMain.handle('rename-file', async (event, oldFilePath, newFilePath) => {
    try {
        if (fs.existsSync(newFilePath)) {
            throw new Error('Ya existe un archivo con ese nombre.');
        }
        fs.renameSync(oldFilePath, newFilePath); // Renombrar archivo
        return true;
    } catch (error) {
        console.error('Error al renombrar el archivo:', error.message);
        return false;
    }
});

//eliminar nota
ipcMain.handle('delete-file', async (event, filePath) => {
    try {
        if (fs.existsSync(filePath)) {
            // console.log("El backend recibió path:", filePath);
            fs.unlinkSync(filePath); // Eliminar el archivo
            return true;
        } else {
            throw new Error('El archivo no existe.');
        }
    } catch (error) {
        console.error('Error al eliminar el archivo:', error);
        return false;
    }
});

//arreglar nombre para eliminar
function sanitizeFileName(name) {
    return name
      .trim()
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '') // caracteres inválidos
      .replace(/\s+/g, '-'); // espacios por guiones
  }

//eliminar carpeta
ipcMain.handle('delete-folder', async (event, folderPath) => {
    try {
        if (fs.existsSync(folderPath)) {
            fs.rmSync(folderPath, { recursive: true, force: true }); // Eliminar carpeta y contenido
            return true;
        } else {
            throw new Error('La carpeta no existe.');
        }
    } catch (error) {
        console.error('Error al eliminar la carpeta:', error);
        return false;
    }
});

// renombrar carpeta
ipcMain.handle('rename-folder', async (event, baseFolderPath, oldFolderPath, newFolderName) => {
    try {
        const newFolderPath = `${baseFolderPath}/${newFolderName}` // Nueva ruta de la carpeta

        if (fs.existsSync(newFolderPath)) {
            if(oldFolderPath === newFolderName){
                throw new Error('Ya existe una carpeta con ese nombre.');
            }
        }

        fs.renameSync(oldFolderPath, newFolderPath); // Renombrar la carpeta
        return true;
    } catch (error) {
        console.error('Error al renombrar la carpeta:', error);
        return false;
    }
});

ipcMain.handle('get-base-folder-path', () => {
    return baseFolderPath;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});