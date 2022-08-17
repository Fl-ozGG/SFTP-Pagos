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
let SFTP_HOST = process.env.SFTP_HOST;
let SFTP_PORT = process.env.SFTP_PORT;
let SFTP_USERNAME = process.env.SFTP_USERNAME;
let SFTP_PASSWORD = process.env.SFTP_PASSWORD;
const LOCAL_LOGS = process.env.LOCAL_LOGS;

let date = new Date();
let actualDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '.log';
let actualHour = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();


const config = {
    host: SFTP_HOST,
    port: SFTP_PORT,
    username: SFTP_USERNAME,
    password: SFTP_PASSWORD
}

function createLogs() {
    fs.mkdir(LOCAL_LOGS, {
        recursive: true
    }, (err) => {
        if (err) throw err;
        writeLog('Carpeta LOGS creada');
    });
    fileName = actualDate;
    global.fileName = fileName;
    fs.writeFile(LOCAL_LOGS + '/' + fileName, '', (err) => {
        if (err) writeLog(err);
    });
}

function createLocalFolder(localFolder) {
    // CREAR TRM IF NOT EXISTS
    fs.access(localFolder, (error) => {
        if (error) {
            fs.mkdirSync({
                localFolder
            });
            writeLog(`Directori ${localFolder} creat`);
        } else {
            writeLog(`No s'ha creat el directori ${localFolder} perquè ja existeix`);
        }
    });
}

function writeLog(text) {
    fs.appendFile(LOCAL_LOGS + '/' + global.fileName, actualHour + ' - ' + text + '\n', (err) => {
        if (err) throw err;
    });
}

function downloadFiles(REMOTE_PATH, LOCAL_PATH) {
    // Connect SFTP
    sftp.connect(config)
        .then(() => {
            writeLog('Connectat al SFTP');
            return sftp.list(REMOTE_PATH);
        })
        // if exists files in remote path
        .then((files) => {
                files.forEach(file => {
                    if (file.name != 'Backup') {
                        sftp.fastGet(REMOTE_PATH + '/' + file.name, LOCAL_PATH + '/' + file.name)
                            .then(() => {
                                writeLog('Descarregat ' + file.name + ' de TRM');
                            })
                            .catch(err => {
                                writeLog(err);
                            })
                            .then(() => {
                                sftp.fastPut(LOCAL_PATH + '/' + file.name, REMOTE_PATH + '/Backup/' + file.name)
                                    .then(() => {
                                        sftp.delete(REMOTE_PATH + '/' + file.name)
                                            .then(() => {
                                                writeLog('Arxiu ' + file.name + ' eliminat de TRM');
                                            })
                                            .catch(err => {
                                                writeLog(err);
                                            })
                                    })
                            })
                    }
                })
                .then(() => {
                    sftp.end();
                    writeLog('Desconnectat del SFTP');
                })
        })
    }



function setup() {
    createLogs();
    createLocalFolder(LOCAL_TRM);
    createLocalFolder(LOCAL_GPA);
    createLocalFolder(LOCAL_ZBE);
    createLocalFolder(LOCAL_CORREUS);
    downloadFiles(LOCAL_TRM, REMOTE_TRM);
    downloadFiles(LOCAL_GPA, REMOTE_GPA);
    //downloadFiles(LOCAL_ZBE, REMOTE_ZBE);
    //downloadFiles(LOCAL_CORREUS, REMOTE_CORREUS);
}

setup();