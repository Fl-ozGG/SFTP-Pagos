const fs = require('fs');
const path = require('path');
require('dotenv').config();

const trmRoute = process.env.LOCAL_TRM;
const zbeRoute = process.env.LOCAL_ZBE;
const originRoute = process.env.LOCAL_CORREUS;
const trashRoute = "C:/Users/igurrea/Desktop/backup de correus/Eliminados";

const tributes = [
    { tributeNumber: '149       ', tributePath: trmRoute },
    { tributeNumber: '026       ', tributePath: zbeRoute }
];

function fileManager() {
    fs.readdir(originRoute, (err, FolderFiles) => {
        if (err) {
            console.error('Error reading origin directory:', err);
        } else {
            const files = FolderFiles
                .filter(isFileByExtension)
                .map(file => path.join(originRoute, file)); // Combina la ruta del directorio con el nombre del archivo

            isTributeValid(files, tributes, () => {
                deleteRemainingFiles(originRoute, tributes);
            });
        }
    });
}

function isFileByExtension(name) {
    // Verifica si el nombre contiene una extensión válida
    return /\.\w+$/.test(name);
}

function isTributeValid(files, tributes, callback) {
    let pendingFiles = files.length;

    if (pendingFiles === 0) {
        callback();
        return;
    }

    files.forEach(filePath => {
        fs.readFile(filePath, 'utf8', (err, content) => {
            if (err) {
                console.error(`Error reading file: ${filePath}`, err);
            } else {
                const matchedTribute = tributes.find(tribute => content.includes(tribute.tributeNumber));
                matchedTribute ? moveFile(filePath, matchedTribute.tributePath) : false;
            }

            pendingFiles--;
            if (pendingFiles === 0) {
                callback();
            }
        });
    });
}

function moveFile(originalPath, destinationPath) {
    const resolvedDestinationPath = path.resolve(destinationPath);

    fs.mkdir(resolvedDestinationPath, { recursive: true }, (err) => {
        if (err) {
            console.error('Error ensuring destination directory exists:', err);
            return;
        }

        const fileName = path.basename(originalPath);
        const newFilePath = path.join(resolvedDestinationPath, fileName);

        fs.access(newFilePath, fs.constants.F_OK, (err) => {
            if (err) {
                // El archivo no existe, mover directamente
                fs.rename(originalPath, newFilePath, (err) => {
                    if (err) {
                        console.error('Error moving file:', err);
                    } else {
                        console.log('File moved successfully to', newFilePath);
                    }
                });
            } else {
                // Si el archivo ya existe, agregar timestamp
                const newFileName = `${Date.now()}_${fileName}`;
                const newFilePathWithTimestamp = path.join(resolvedDestinationPath, newFileName);

                fs.rename(originalPath, newFilePathWithTimestamp, (err) => {
                    if (err) {
                        console.error('Error renaming and moving file:', err);
                    } else {
                        console.log('File renamed and moved successfully to', newFilePathWithTimestamp);
                    }
                });
            }
        });
    });
}

function deleteFile(filePath) {
    fs.unlink(filePath, (err) => {
        if (err) {
            if (err.code === 'ENOENT') {
                console.error(`File not found: ${filePath}`);
            } else {
                console.error(`Error deleting file: ${err.message}`);
            }
        } else {
            console.log(`File deleted successfully: ${filePath}`);
        }
    });
}

function deleteRemainingFiles(originRoute, tributes) {
    fs.readdir(originRoute, (err, files) => {
        if (err) {
            console.error(`Error reading origin directory: ${originRoute}`, err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(originRoute, file);

            fs.readFile(filePath, 'utf8', (err, content) => {
                if (err) {
                    console.error(`Error reading file: ${filePath}`, err);
                    return;
                }

                const isNotMatched = !tributes.some(tribute => content.includes(tribute.tributeNumber));
                if (isNotMatched) {
                    deleteFile(filePath);
                }
            });
        });
    });
}

// Iniciar el gestor de archivos
fileManager();
