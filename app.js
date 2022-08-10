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
        console.log('Folder LOGS created');
    });
    fileName = actualDate;
    global.fileName = fileName;
    fs.writeFile(LOCAL_LOGS + '/' + fileName, '', (err) => {
        if (err) throw err;
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
            console.log('Directory exists');
            writeLog(`No s'ha creat el directori ${localFolder} perquè ja existeix`);
        }
    });
}

function writeLog(text) {
    fs.appendFile(LOCAL_LOGS + '/' + global.fileName, actualHour + ' - ' + text + '\n', (err) => {
        if (err) throw err;
    });
}

function downloadFiles(remoteFolder, localFolder) {
    sftp.connect(config)
        .then(() => {
            return sftp.list(remoteFolder);
        }).then((list) => {
            list.forEach((item) => {
                if (item.name != 'Backup') {
                    sftp.fastGet(remoteFolder + '/' + item.name, localFolder + '/' + item.name)
                        .then(() => {
                            writeLog(`Descarregat ${item.name}`);
                        }).catch((err) => {
                            writeLog(`Error descarregant ${item.name}`);
                            console.log(err);
                        }).finally(() => {
                            sftp.end();
                        })
                }
            })
        })
}



function setup() {
    createLogs();
    createLocalFolder(LOCAL_TRM);
    createLocalFolder(LOCAL_GPA);
    createLocalFolder(LOCAL_ZBE);
    createLocalFolder(LOCAL_CORREUS);
    //downloadFiles(REMOTE_TRM, LOCAL_TRM);
    downloadFiles(REMOTE_GPA, LOCAL_GPA);
    //downloadFiles(REMOTE_ZBE, LOCAL_ZBE);
    //downloadFiles(REMOTE_CORREUS, LOCAL_CORREUS);
}

setup();