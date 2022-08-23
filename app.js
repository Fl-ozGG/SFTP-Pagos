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
        console.log(`Carpeta LOGS ${fileName} creada correctament.`);
    });
    fileName = actualDate;
    global.fileName = fileName;
    fs.writeFile(LOCAL_LOGS + '/' + fileName, '', (err) => {
        if (err) console.log(err);
    });
}

function createLocalFolder(localFolder) {
    fs.access(localFolder, (error) => {
        if (error) {
            fs.mkdirSync({
                localFolder
            });
            console.log(`Directori ${localFolder} creat`);
        } else {
            console.log(`No s'ha creat el directori ${localFolder} perquè ja existeix`);
        }
    });
}

function writeLog(text) {
    fs.appendFile(LOCAL_LOGS + '/' + global.fileName, actualHour + ' - ' + text + '\n', (err) => {
        if (err) throw err;
    });
}

function downloadFiles(remotePath, localPath) {
    sftp.connect(config)
        .then(() => {
            console.log(`Connectat a ${remotePath}`);
            return sftp.list(remotePath);
        })
        .then(files => {
            files.forEach(file => {
                if (file.name != 'Backup') {
                    console.log(`Descarregat ${file.name}`)
                    sftp.fastGet(remotePath + '/' + file.name, localPath + '/' + file.name)
                        .then(() => {
                            console.log(`Copiant ${file.name} a Backup`)
                            sftp.fastPut(localPath + '/' + file.name, remotePath + '/Backup/' + file.name)
                                .then(() => {
                                    sftp.delete(remotePath + '/' + file.name)
                                        .then(() => {
                                            sftp.delete(remotePath + file.name)
                                            console.log(`Fitxer ${file.name} eliminat de TRM`);
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        }).finally(() => {
                                            console.log(`Desconnectant de ${remotePath}`);
                                            sftp.end();
                                        })
                                })
                        })
                }
            })
        }).finally(() => {
            console.log(`Desconnectant de ${remotePath}`);
            sftp.end();
        })
}

createLocalFolder(LOCAL_TRM);
createLocalFolder(LOCAL_GPA);
createLocalFolder(LOCAL_ZBE);
createLocalFolder(LOCAL_CORREUS);
createLogs();

setTimeout(() => {
    downloadFiles(REMOTE_TRM, LOCAL_TRM);
}, 1000);

setTimeout(() => {
    downloadFiles(REMOTE_GPA, LOCAL_GPA);
}, 50000);

setTimeout(() => {
    downloadFiles(REMOTE_ZBE, LOCAL_ZBE);
}, 10000);

setTimeout(() => {
    downloadFiles(REMOTE_CORREUS, LOCAL_CORREUS);
}, 15000);
