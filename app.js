let Client = require('ssh2-sftp-client');
let sftp = new Client();
let fs = require('fs');
const { table } = require('table');
require('dotenv').config();

// VARIABLES DE ENTORNO
const REMOTE_TRM = process.env.REMOTE_TRM;
const REMOTE_GPA = process.env.REMOTE_GPA;
const REMOTE_ZBE = process.env.REMOTE_ZBE;
const REMOTE_CORREUS = process.env.REMOTE_CORREUS;
const REMOTE_SUPORTS = process.env.REMOTE_SUPORTS; // Nueva variable
const LOCAL_TRM = process.env.LOCAL_TRM;
const LOCAL_GPA = process.env.LOCAL_GPA;
const LOCAL_ZBE = process.env.LOCAL_ZBE;
const LOCAL_CORREUS = process.env.LOCAL_CORREUS;
const LOCAL_SUPORTS = process.env.LOCAL_SUPORTS; // Nueva variable
const LOCAL_LOGS = process.env.LOCAL_LOGS;
const SFTP_HOST = process.env.SFTP_HOST;
const SFTP_PORT = process.env.SFTP_PORT;
const SFTP_USERNAME = process.env.SFTP_USERNAME;
const SFTP_PASSWORD = process.env.SFTP_PASSWORD;
const date = new Date();
const actualDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
const actualHour = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;

// Funció per a comprovar posar extensió .txt si no la té 
function checkExtension(file) {
    const extension = file.split('.').pop();

    if (extension !== 'txt' && extension !== 'xml') {
        return `${file}.txt`;
    } else {
        return file.endsWith('.xml') ? file : `${file}.txt`;
    }
}
// Configuració de la connexió amb el servidor SFTP
const config = {
    host: SFTP_HOST,
    port: SFTP_PORT,
    username: SFTP_USERNAME,
    password: SFTP_PASSWORD
}

// Funció per crear logs
function createLogs() {
    fileName = actualDate;
    global.fileName = fileName;
    fs.writeFile(`${LOCAL_LOGS}/${fileName}.log`, '', (err) => {
        if (err) {
            writeLog(err);
        }
    });
}


// Funció per escriure logs
function writeLog(text) {
    fs.appendFile(`${LOCAL_LOGS}/${global.fileName}.log`, `${actualHour}-${text}\n`, (err) => {
        if (err) {
            writeLog(err);
        };
    });
}

// Funció per descarregar els fitxers del servidor
async function downloadFiles(remotePath, localPath) {
    let files = await sftp.list(remotePath);
    let downloadedFiles = [];
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file.type == '-') {
            await sftp.fastGet(`${remotePath}/${file.name}`, `${localPath}/${file.name}`);
            let localFile = checkExtension(file.name);
            if (localFile !== file.name) {
                fs.rename(`${localPath}/${file.name}`, `${localPath}/${localFile}`, (err) => {
                    if (err) {
                        writeLog(err);
                    }
                });
            }
            downloadedFiles.push(localFile);
            writeLog(`* ${file.name} descarregat i copiat correctament com ${localFile}. *`);
        }
    }
    return downloadedFiles;
}

// Funció per eliminar els fitxers del servidor
async function deleteFiles(remotePath) {
    let files = await sftp.list(remotePath);
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file.type == '-') {
            await sftp.delete(`${remotePath}/${file.name}`);
            writeLog(`* ${file.name} eliminat correctament *`);
        }
    }
}

// Funció principal 
async function main() {
    createLogs();

    try {
        await sftp.connect(config);
        writeLog('Connexió amb el servidor SFTP establerta correctament.');

        // Descargar archivos y obtener la lista de nombres de archivos descargados
        const downloadedFilesTRM = await downloadFiles(REMOTE_TRM, LOCAL_TRM);
        const downloadedFilesGPA = await downloadFiles(REMOTE_GPA, LOCAL_GPA);
        const downloadedFilesZBE = await downloadFiles(REMOTE_ZBE, LOCAL_ZBE);
        const downloadedFilesCORREUS = await downloadFiles(REMOTE_CORREUS, LOCAL_CORREUS);
        const downloadedFilesSUPORTS = await downloadFiles(REMOTE_SUPORTS, LOCAL_SUPORTS); // Descargar SUPORTS

        // Eliminar archivos en el servidor
        await deleteFiles(REMOTE_TRM);
        await deleteFiles(REMOTE_GPA);
        await deleteFiles(REMOTE_ZBE);
        await deleteFiles(REMOTE_CORREUS);
        await deleteFiles(REMOTE_SUPORTS); // Eliminar archivos de SUPORTS

        writeLog('Connexió amb el servidor SFTP tancada correctament.');

        // Mostrar nombres de archivos descargados en forma de tabla
        const tableData = [
            ['Títol', 'Fitxers descarregats'],
            ['TRM', downloadedFilesTRM.length > 0 ? downloadedFilesTRM.join('\n') : '0'],
            ['GPA', downloadedFilesGPA.length > 0 ? downloadedFilesGPA.join('\n') : '0'],
            ['ZBE', downloadedFilesZBE.length > 0 ? downloadedFilesZBE.join('\n') : '0'],
            ['Correus', downloadedFilesCORREUS.length > 0 ? downloadedFilesCORREUS.join('\n') : '0'],
            ['SUPORTS', downloadedFilesSUPORTS.length > 0 ? downloadedFilesSUPORTS.join('\n') : '0'] // Añadir SUPORTS a la tabla
        ];

        console.log(table(tableData));

        setTimeout(() => {
            console.log("Proces executat correctament.");
        }, "6000");



        await sftp.end();
        process.exit(0);
    } catch (err) {
        writeLog(err);
        process.exit(0);
    }
}

// Ejecutar main
main();