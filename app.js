let Client = require('ssh2-sftp-client');
let sftp = new Client();
let fs = require('fs');
require('dotenv').config();

// VARIABLES DE ENTORNO
const REMOTE_TRM = process.env.REMOTE_TRM;
const REMOTE_GPA = process.env.REMOTE_GPA;
const REMOTE_ZBE = process.env.REMOTE_ZBE;
const REMOTE_CORREUS = process.env.REMOTE_CORREUS;
const LOCAL_TRM = process.env.LOCAL_TRM;
const LOCAL_GPA = process.env.LOCAL_GPA;
const LOCAL_ZBE = process.env.LOCAL_ZBE;
const LOCAL_CORREUS = process.env.LOCAL_CORREUS;
const LOCAL_LOGS = process.env.LOCAL_LOGS;
const BACKUP_TRM = process.env.BACKUP_TRM;
const BACKUP_GPA = process.env.BACKUP_GPA;
const BACKUP_ZBE = process.env.BACKUP_ZBE;
const BACKUP_CORREUS = process.env.BACKUP_CORREUS;
const SFTP_HOST = process.env.SFTP_HOST;
const SFTP_PORT = process.env.SFTP_PORT;
const SFTP_USERNAME = process.env.SFTP_USERNAME;
const SFTP_PASSWORD = process.env.SFTP_PASSWORD;
const date = new Date();
const actualDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
const actualHour = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;


// Configuració de la connexió amb el servidor SFTP
const config = {
    host: SFTP_HOST,
    port: SFTP_PORT,
    username: SFTP_USERNAME,
    password: SFTP_PASSWORD
}

// Funció per crear logs
function createLogs() {
    fs.mkdir(LOCAL_LOGS, {
        recursive: true
    }, (err) => {
        if (err) throw err;
    });
    fileName = actualDate;
    global.fileName = fileName;
    fs.writeFile(`${LOCAL_LOGS}/${fileName}.log`, '', (err) => {
        if (err) {
            writeLog(err);
        }
    });
}

// Funció per crear directoris locals
function createLocalFolder(localFolder) {
    fs.access(localFolder, (error) => {
        if (error) {
            fs.mkdirSync({
                localFolder
            });
        } 
    });
}

// Funció per escriure logs
function writeLog(text) {
    fs.appendFile(`${LOCAL_LOGS}/${global.fileName}`, `${actualHour}-${text}\n`, (err) => {
        if (err) {
            writeLog(err);
        };
    });
}

// Funció per descarregar els fitxers del servidor
async function downloadFiles(remotePath, localPath, backupPath) {
    let files = await sftp.list(remotePath);
    for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file.type == '-') {
            await sftp.fastGet(`${remotePath}/${file.name}`, `${localPath}/${file.name}`);
            await sftp.fastGet(`${remotePath}/${file.name}`, `${backupPath}/${file.name}`);
            writeLog(`* ${file.name} descarregat i copiat correctament. *`);
        }
    }
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
    createLocalFolder(LOCAL_TRM);
    createLocalFolder(LOCAL_GPA);
    createLocalFolder(LOCAL_ZBE);
    createLocalFolder(LOCAL_CORREUS);
    createLocalFolder(BACKUP_TRM);
    createLocalFolder(BACKUP_GPA);
    createLocalFolder(BACKUP_ZBE);
    createLocalFolder(BACKUP_CORREUS);
    try {
        await sftp.connect(config);
        writeLog('Connexió amb el servidor SFTP establerta correctament.');
        await downloadFiles(REMOTE_TRM, LOCAL_TRM, BACKUP_TRM);
        await downloadFiles(REMOTE_GPA, LOCAL_GPA, BACKUP_GPA);
        await downloadFiles(REMOTE_ZBE, LOCAL_ZBE, BACKUP_ZBE);
        await downloadFiles(REMOTE_CORREUS, LOCAL_CORREUS, BACKUP_CORREUS);
        await deleteFiles(REMOTE_TRM);
        await deleteFiles(REMOTE_GPA);
        await deleteFiles(REMOTE_ZBE);
        await deleteFiles(REMOTE_CORREUS);
        writeLog('Connexió amb el servidor SFTP tancada correctament.');
        await sftp.end();
    } catch (err) {
        writeLog(err);
    }
}

// Execució del programa
main();
