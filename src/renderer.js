document.addEventListener('DOMContentLoaded', async () => {
    const folderList = document.getElementById('folders');
    const folderItem = document.querySelectorAll('folder-item');
    const createFolderButton = document.getElementById('create-folder');
    const createNotaButton = document.getElementById('create-note');
    
    const modal = document.getElementById('modal');
    const saveFolderButton = document.getElementById('save-folder');
    const closeModalButton = document.getElementById('close-modal');
    const folderNameInput = document.getElementById('folder-name');
    
    const modalRename = document.getElementById('modal-rename');
    const renameFolderButton = document.getElementById('save-folder-rename');
    const closeRenameModalButton = document.getElementById('close-modal-folder-rename');
    const folderRenameInput = document.getElementById('folder-new-name');
    
    const modalDeleteFile = document.getElementById('modal-delete');
    const aceptarDeleteButton = document.getElementById('delete-file')
    const cancelDeleteButton = document.getElementById('close-modal-delete-file')
    
    const tituloNotaEditor = document.getElementById('titulo-nota');
    
    const fileList = document.getElementById('file-list');
    
    const editor = document.getElementById('editor');
    
    const toggleBtn = document.getElementById('toggle-aside');
    const toggleBtnHide = document.getElementById('toggle-aside-hide');
    const sidebar = document.getElementById('sidebar');
    
    let currentFolderPath = '';
    let currentFilePath = '';
    
    function showEditor() {
        document.getElementById("main").style.display = "block";
        document.getElementById("placeholder-message").style.display = "none";
    }
    
    function showPlaceholder() {
        document.getElementById("main").style.display = "none";
        document.getElementById("placeholder-message").style.display = "flex";
    }
    
    const getBaseFolderPath = async () => {
        const baseFolderPath = await window.electronAPI.getBaseFolderPath();
        return baseFolderPath;
    };
    
    toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
    });
    toggleBtnHide.addEventListener('click', () => {
        sidebar.classList.toggle('hidden');
    });
    
    const toolbarOptions = [
        [{ 'header': [1, 2, 3, false] }],
        [{ 'font': [] }],
        ['bold', 'italic', 'underline', 'strike'], 
        [{ 'color': [] }, { 'background': [] }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'align': [] }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        [{ 'size': ['small', false, 'large', 'huge'] }],  
    ];
    
    const quill = new Quill('#editor-container', {
        theme: 'snow',
        modules: {
            toolbar: toolbarOptions
        }
    });

    quill.on('text-change', function(delta, oldDelta, source) {
        if (source === 'user') {
            autoSaveNote();
        }
    });

    tituloNotaEditor.addEventListener('input', () => {
        autoSaveNote();
    });

    // leer carpetas
    async function renderFolders() {

        const folders = await window.electronAPI.listFolders();
        // console.log('Subcarpetas encontradas:', folders);
      
        const foldersListElement = document.getElementById('folders');
        foldersListElement.innerHTML = '';  // Limpiar el listado anterior
      
        folders.forEach(async folder => {
            const li = document.createElement('li');
            li.textContent = folder;
            li.className = 'folder-item';
            li.id = 'folder-item';
            const folderName = `${folder}`;
            li.folderName = folderName;
            const baseFolderPath = await window.electronAPI.getBaseFolderPath();
            li.dataset.folderPath = `${baseFolderPath}/${folderName}`;

            const buttonsContainer = document.createElement('div');
            buttonsContainer.className = 'controls-folders';
            
            const deleteButton = document.createElement('button');
            deleteButton.textContent = '➖';
            deleteButton.id = 'eliminar-folder';
            deleteButton.className = 'eliminar-folder';
            deleteButton.dataset.folderPath = `${baseFolderPath}/${folder}`;

            const editFolderButton = document.createElement('button');
            editFolderButton.textContent = '⚙️'
            editFolderButton.id = 'editar-folder';
            editFolderButton.className = 'editar-folder';
            editFolderButton.dataset.folderPath = `${baseFolderPath}/${folder}`;
            
            buttonsContainer.appendChild(deleteButton);
            buttonsContainer.appendChild(editFolderButton);
            li.appendChild(buttonsContainer);
            foldersListElement.appendChild(li);
        });
    }

    // leer archivos en carpetas
    const listFilesInFolder = async (folderPath) => {
        try {
            const files = await window.electronAPI.listFiles(folderPath);
            // console.log('current folder...', currentFolderPath)
            return files;
        } catch (error) {
            // console.log(currentFolderPath)
            console.error('Error al listar archivos:', error);
            return [];
        }
    };

    // render archivos en carpetas
    const renderFileList = (files, folderPath) => {
        const notesFilesList = document.getElementById('file-list');
        notesFilesList.innerHTML = '';
        currentFolderPath = folderPath;
        // console.log('current folder...', currentFolderPath)

        if(files.length === 0) {
            notesFilesList.innerHTML = '<p>No hay notas en esta carpeta aun.</p>';
            return;
        }

        files.forEach(file => {
            const fileElement = document.createElement('div');
            const fileNameWithoutExt = file.replace('.txt', ''); // Remover .txt
            fileElement.textContent = fileNameWithoutExt;
            const fileName = `${file}`;
            fileElement.fileName = fileName;
            fileElement.className = 'file-item';
            fileElement.dataset.filePath = `${folderPath}/${file}`;// Ruta completa

            const deleteButton = document.createElement('button');
            deleteButton.textContent = '➖';
            deleteButton.id = 'eliminar-nota';
            deleteButton.className = 'eliminar-nota';
            deleteButton.dataset.filePath = `${folderPath}/${file}`;

            fileElement.appendChild(deleteButton);
            notesFilesList.appendChild(fileElement);
        });

        // Registrar eventos de clic en los elementos generados
        document.querySelectorAll('.file-item').forEach(item => {
            item.addEventListener('click', (event) => {
                // event.stopPropagation();
                const filePath = item.dataset.filePath;
                const fileName = item.fileName;
                currentFilePath = filePath;
                openFile(fileName,filePath); // Función para abrir el archivo
            });
        });
    };

    // leer y abrir nota
    const openFile = async (fileName, filePath) => {
        try {

            showEditor();

            const editor = document.getElementById('editor');
            // const editorQuill = document.getElementById('editor-container');
            const fileNameWithoutExt = fileName.replace('.txt', ''); // Remover .txt
            tituloNotaEditor.value = `${fileNameWithoutExt}`;
            // console.log('Valor de tituloNotaEditor:', tituloNotaEditor.value);
            // console.log('Valor de path de la nota:', filePath);
            // editor.value = '';
            quill.root.innerHTML = '';
            // console.log('Intentando leer el archivo en la ruta:', filePath);
            const content = await window.electronAPI.readFile(filePath);
            // console.log('Contenido del archivo recibido:', content);
            // console.log('Tamaño del contenido:', content.length);
    
            // Aquí puedes mostrar el contenido en tu editor de texto
            if (content) {
                const editor = document.getElementById('editor');
                // editor.value = content; // Mostrar el contenido en el editor
                quill.root.innerHTML = content; // Mostrar el contenido en el editor
            } else {
                const editor = document.getElementById('editor');
                quill.root.placeholder  = 'esta nota esta vacia, comienza a escribir';
            }

            // document.getElementById('save-btn').removeEventListener('click', saveClick); // Eliminar evento previo
            // document.getElementById('save-btn').addEventListener('click', saveClick); // Agregar nuevo evento

        } catch (error) {
            console.error('Error al abrir el archivo:', error);
        }
    };

    const saveClick = async () => {
        const newNoteName = `${tituloNotaEditor.value}.txt`;
        // const editorQuill = document.getElementById('editor-container');
        // const content = document.getElementById('editor').value; // Contenido del editor
        const content = quill.root.innerHTML; // Contenido del editor

        saveFile(currentFilePath, content, newNoteName);
    }

    // autosave nota
    function autoSaveNote() {
        const content = quill.root.innerHTML;
        // const content = quill.getText();
        const newNoteName = `${tituloNotaEditor.value}.txt`; // asegúrate de tener esta variable definida
        saveFile(currentFilePath, content, newNoteName);
    }
    

    //Guardar contenido de la nota
    const saveFile = async (filePath, content, newNoteName) => {
        try {

            const newFilePath = `${currentFolderPath}/${newNoteName}`;

            if (filePath !== newFilePath) {
                // console.log(filePath, newFilePath)
                
                const renamed = await window.electronAPI.renameFile(filePath, newFilePath);
                if (!renamed) {
                    throw new Error('Error al renombrar el archivo.');
                }
                // console.log(`Archivo renombrado a: ${newFilePath}`);
                
                listFilesInFolder(currentFolderPath).then(files => {
                    renderFileList(files, currentFolderPath);
                });

                filePath = newFilePath; // Actualizar la ruta con el nuevo nombre
                currentFilePath = filePath;
            }

            const success = await window.electronAPI.writeFile(filePath, content);
            if (success) {
                // console.log('Archivo guardado exitosamente.', filePath, content);
                // alert('Nota guardada correctamente.');
                return filePath;
            } else {
                console.error('Error al guardar el archivo.');
            }
        } catch (error) {
            console.error('Error al intentar guardar el archivo:', error);
        }
    };

    //crear carpeta
    createFolderButton.addEventListener('click', () => {
        modal.style.display = 'flex';
        modal.style.justifyContent = "center";
        modal.style.alignItems = "center";
    });

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
        folderNameInput.value = '';
    });

    saveFolderButton.addEventListener('click', async () => {
        const folderName = folderNameInput.value.trim();

        if (folderName) {
            const success = await window.electronAPI.createFolder(folderName);
            // console.log('envio de carpeta')
            if (success) {
                // console.log('carpeta creada')
                // Agregar la nueva carpeta visualmente
                renderFolders();

                modal.style.display = 'none';
                folderNameInput.value = '';
            } else {
                alert('La carpeta ya existe o no se pudo crear.');
            }
        }
    });

    //crear nota
    createNotaButton.addEventListener('click', async () => {
        // modalNota.style.display = 'block';

        const noteName = `nueva nota`;

        try {
            await window.electronAPI.createFile(currentFolderPath, noteName); // Función que manejaremos en `main.js`
            // alert('Nota creada exitosamente.');
    
            // Opcional: Recargar la lista de archivos en la interfaz
            listFilesInFolder(currentFolderPath).then(files => {
                renderFileList(files, currentFolderPath);
            });
            
            // console.log(currentFolderPath)
            return currentFolderPath;
        } catch (error) {
            console.error('Error al crear la nota:', error);
            alert('No se pudo crear la nota.');
        }
    });

    folderList.addEventListener('click', async (event) => {
        event.stopPropagation();
        const folderItem = event.target.closest('.folder-item');
        getBaseFolderPath();
        if (!folderItem) return;

        // Construir la ruta completa de la carpeta
        const folderPath = event.target.dataset.folderPath;
        // // console.log('Ruta completa de la carpeta seleccionada:', folderPath);
        const files = await listFilesInFolder(folderPath); // Obtener archivos dentro de la carpeta
        renderFileList(files, folderPath);
    });
    

    //eliminar nota
    fileList.addEventListener('click', async (event) => {
        const deleteButton = event.target.closest('.eliminar-nota')
        if (!deleteButton) return;

        event.stopPropagation();
        
        if (deleteButton) {
            // console.log('boton leido');
            const filePath = deleteButton.dataset.filePath;
            // console.log('path a eliminar:', filePath);

            modalDeleteFile.style.display = 'flex';
            modalDeleteFile.style.justifyContent = "center";
            modalDeleteFile.style.alignItems = "center";
            const nombreVariable = document.getElementById('titulo-variable');
            nombreVariable.innerHTML = '¿Quieres eliminar eliminar esta nota?';

            eliminarNota(filePath)
        }
    })
    const eliminarNota = async (filePath) => {
        // const confirmDelete = confirm('¿Estás seguro de que quieres eliminar esta nota?');

        if (!filePath) {
            console.error('No se encontró la ruta del archivo para eliminar');
            return;
        }

        cancelDeleteButton.onclick = async () => {
            modalDeleteFile.style.display = 'none';
        }

        aceptarDeleteButton.onclick = async () => {
            const success = await window.electronAPI.deleteFile(filePath);
            if (success) {
                    // console.log("leyendo primero para eliminar", filePath);
                    // alert('Nota eliminada correctamente.');-
                    showPlaceholder();
                    listFilesInFolder(currentFolderPath).then(files => {
                        renderFileList(files, currentFolderPath); // Volver a cargar la lista
                    });
                    modalDeleteFile.style.display = 'none';
            } else {
                alert('Error al eliminar la nota.');
            }
        }

        // if (confirmDelete) {
        //     const success = await window.electronAPI.deleteFile(filePath);
        //     if (success) {
        //             console.log("leyendo primero para eliminar", filePath);
        //             // alert('Nota eliminada correctamente.');-
        //             listFilesInFolder(currentFolderPath).then(files => {
        //                 renderFileList(files, currentFolderPath); // Volver a cargar la lista
        //             });
        //     } else {
        //         alert('Error al eliminar la nota.');
        //     }
        // }
    }

    //eliminar folder
    folderList.addEventListener('click', async (event) => {
        event.stopPropagation();
        const deleteButton = event.target.closest('.eliminar-folder')
        if (!deleteButton) return;

        if (deleteButton) {
            // console.log('boton folder leido');
            const folderPath = deleteButton.dataset.folderPath;

            modalDeleteFile.style.display = 'flex';
            modalDeleteFile.style.justifyContent = "center";
            modalDeleteFile.style.alignItems = "center";
            const nombreVariable = document.getElementById('titulo-variable');
            nombreVariable.innerHTML = '¿Estás seguro de que quieres eliminar esta carpeta y todo su contenido?';

            eliminarFolder(folderPath)
        }
    });

    const eliminarFolder = async (folderPath) => {
        // const confirmDelete = confirm('¿Estás seguro de que quieres eliminar esta carpeta y todo su contenido?');
        
        cancelDeleteButton.onclick = async () => {
            modalDeleteFile.style.display = 'none';
        }

        aceptarDeleteButton.onclick = async () => {
            const success = await window.electronAPI.deleteFolder(folderPath);
            if (success) {
                // alert('Carpeta eliminada correctamente.');
                modalDeleteFile.style.display = 'none';
                renderFolders() // Volver a cargar la lista de carpetas
            } else {
                alert('Error al eliminar la carpeta.');
            }
        }

        // if (confirmDelete) {
        //     const success = await window.electronAPI.deleteFolder(folderPath);
        //     if (success) {
        //         // alert('Carpeta eliminada correctamente.');
        //         renderFolders() // Volver a cargar la lista de carpetas
        //     } else {
        //         alert('Error al eliminar la carpeta.');
        //     }
        // }
    }

    //editar folder
    folderList.addEventListener('click', async (event) => {
        event.stopPropagation();
        const editButton = event.target.closest('.editar-folder')
        const folderEditando = event.target.closest('.folder-item')
        if (!editButton) return;

        if (editButton) {
            modalRename.style.display = 'flex';
            modalRename.style.justifyContent = "center";
            modalRename.style.alignItems = "center";

            const folderPath = editButton.dataset.folderPath;
            currentFolderPath = folderPath;
            const nombreActual = folderEditando.folderName;
            // console.log(currentFolderPath)
            folderRenameInput.value = nombreActual;

            closeRenameModalButton.onclick = async () => {
                modalRename.style.display = 'none';
                folderRenameInput.value = '';
            }

            renameFolderButton.onclick = async () => {
                const folderName = folderRenameInput.value.trim();

                if (folderName) {
                    const baseFolderPath = await window.electronAPI.getBaseFolderPath()
                    const success = await window.electronAPI.renameFolder(baseFolderPath, folderPath, folderName);
                    // console.log('envio de carpeta')
                    if (success) {
                        // console.log('carpeta renombrada')
                        
                        // Agregar la nueva carpeta visualmente
                        renderFolders();

                        modalRename.style.display = 'none';
                        folderRenameInput.value = '';
                    } else {
                        alert('La carpeta ya existe o no se pudo crear.');
                    }
                }
            }
        }
    });

    // closeRenameModalButton.addEventListener('click', () => {
    //     modal.style.display = 'none';
    //     folderRenameInput.value = '';
    // });

    // renameFolderButton.addEventListener('click', async () => {
    //     const folderName = folderRenameInput.value.trim();

    //     if (folderName) {
    //         const baseFolderPath = await window.electronAPI.getBaseFolderPath()
    //         const success = await window.electronAPI.renameFolder(baseFolderPath, folderPath, folderName);
    //         console.log('envio de carpeta')
    //         if (success) {
    //             console.log('carpeta renombrada')
    //             // Agregar la nueva carpeta visualmente
    //             renderFolders();

    //             modal.style.display = 'none';
    //             folderNameInput.value = '';
    //         } else {
    //             alert('La carpeta ya existe o no se pudo crear.');
    //         }
    //     }
    // });

    getBaseFolderPath().then(basePath => {
        // console.log('La ruta base en esta computadora es:', basePath);
    });

    //Inicializar
    renderFolders();
});