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
const BACKUP_TRM = process.env.BACKUP_TRM;
const BACKUP_GPA = process.env.BACKUP_GPA;
const BACKUP_ZBE = process.env.BACKUP_ZBE;
const BACKUP_CORREUS = process.env.BACKUP_CORREUS;
let SFTP_HOST = process.env.SFTP_HOST;
let SFTP_PORT = process.env.SFTP_PORT;
let SFTP_USERNAME = process.env.SFTP_USERNAME;
let SFTP_PASSWORD = process.env.SFTP_PASSWORD;
const LOCAL_LOGS = process.env.LOCAL_LOGS;

const date = new Date();
const actualDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + '.log';
const actualHour = date.getHours() + ':' + date.getMinutes() + ':' + date.getSeconds();

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
    fs.writeFile(`${LOCAL_TRM}/${fileName}`, '', (err) => {
        if (err) console.log(err);
    });
}

function createLocalFolder(localFolder) {
    fs.access(localFolder, (error) => {
        if (error) {
            fs.mkdirSync({
                localFolder
            });
            console.log(`* Directori ${localFolder} creat *`);
        } else {
            console.log(`${localFolder} ja existeix`);
        }
    });
}

function writeLog(text) {
    fs.appendFile(`${LOCAL_LOGS}/${global.fileName}`, `${actualHour}-${text}\n`, (err) => {
        if (err) throw err;
    });
}

function downloadFiles(remotePath, localPath, backupPath) {
    sftp.list(remotePath)
        .then(files => {
            files.forEach(file => {
                if (file.name !== 'Backup') {
                    console.log(`Descarregant ${file.name}...`);
                    sftp.fastGet(`${remotePath}/${file.name}`, `${localPath}/${file.name}`)
                        .then(() => {
                            console.log(`Copiant ${file.name} a Backup...`)
                            sftp.fastGet(`${remotePath}/${file.name}`, `${backupPath}/${file.name}`)
                                .then(() => {
                                    sftp.delete(`${remotePath}/${file.name}`)
                                        .catch(err => {
                                            console.log(err);
                                        })
                                })
                        })
                } else {
                    console.log(`No hi ha fitxers a ${remotePath}`);
                }
            })
        }).catch(err => {
            console.log(err);
        })
}

// FUNCION PARA DESCARGAR ARCHIVOS
function downloadFilesTest() {
    // Connect SFTP
    sftp.connect(config)
        .then(() => {
            console.log('Connectat al SFTP');
            return sftp.list(REMOTE_TRM);
        })
        .then(async files => {
            files.forEach(file => {
                if (file.name !== 'Backup') {
                    sftp.fastGet(`${REMOTE_TRM}/${file.name}`, `${LOCAL_TRM}/${file.name}`)
                    sftp.fastGet(`${REMOTE_TRM}/${file.name}`, `${BACKUP_TRM}/${file.name}`)
                        .then(() => {
                            console.log(`Descarregat: ${file.name} de TRM`);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                        .then(() => {
                            sftp.fastGet(`${REMOTE_TRM}/${file.name}`, `${BACKUP_TRM}/${file.name}`)
                                .then(() => {
                                    sftp.delete(`${REMOTE_TRM}/${file.name}`)
                                        .then(() => {
                                            console.log(`Eliminat ${file.name} de TRM`);
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        })
                                })
                        })
                } else {
                    console.log('No hi ha fitxers a TRM');
                }
            })
        })
        // DOWNLOAD GPA - MOVE TO BACKUP - DELETE ORIGINAL FILES FROM ROOT
        .then(() => {
            return sftp.list(REMOTE_GPA);
        })
        .then(files => {
            files.forEach(file => {
                if (file.name !== 'Backup') {
                    sftp.fastGet(`${REMOTE_GPA}/${file.name}`, `${LOCAL_GPA}/${file.name}`)
                    sftp.fastGet(`${REMOTE_GPA}/${file.name}`, `${BACKUP_GPA}/${file.name}`)
                        .then(() => {
                            console.log(`Descarregat: ${file.name} de GPA`);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                        .then(() => {
                            sftp.fastGet(`${REMOTE_GPA}/${file.name}`, `${BACKUP_GPA}/${file.name}`)
                                .then(() => {
                                    sftp.delete(`${REMOTE_GPA}/${file.name}`)
                                        .then(() => {
                                            console.log(`Elimninat ${file.name} de GPA`);
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        })
                                })
                        })
                } else {
                    console.log('No hi ha fitxers a GPA');
                }
            })
        })
        // DOWNLOAD ZBE - MOVE TO BACKUP - DELETE ORIGINAL FILES FROM ROOT
        .then(() => {
            return sftp.list(REMOTE_ZBE);
        })
        .then(files => {
            files.forEach(file => {
                if (file.name !== 'Backup') {
                    sftp.fastGet(`${REMOTE_ZBE}/${file.name}`, `${LOCAL_ZBE}/${file.name}`)
                    sftp.fastGet(`${REMOTE_ZBE}/${file.name}`, `${BACKUP_ZBE}/${file.name}`)
                        .then(() => {
                            console.log(`Descarregat ${file.name} de ZBE`);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                        .then(() => {
                            sftp.fastGet(`${REMOTE_ZBE}/${file.name}`, `${BACKUP_ZBE}/${file.name}`)
                                .then(() => {
                                    sftp.delete(`${REMOTE_ZBE}/${file.name}`)
                                        .then(() => {
                                            console.log(`Eliminat ${file.name} de ZBE`);
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        })
                                })
                        })
                } else {
                    console.log('No hi ha fitxers a ZBE');
                }
            })
        })
        // DOWNLOAD CORREUS - MOVE TO BACKUP - DELETE ORIGINAL FILES FROM ROOT
        .then(() => {
            return sftp.list(REMOTE_CORREUS);
        })
        // DOWNLOAD CORREUS FILES FROM SFTP TO LOCAL
        .then(files => {
            files.forEach(file => {
                if (file.name !== 'Backup') {
                    sftp.fastGet(`${REMOTE_CORREUS}/${file.name}`, `${LOCAL_CORREUS}/${file.name}`)
                    sftp.fastGet(`${REMOTE_CORREUS}/${file.name}`, `${BACKUP_CORREUS}/${file.name}`)
                        .then(() => {
                            console.log(`Descarregat ${file.name} de CORREUS`);
                        })
                        .catch(err => {
                            console.log(err);
                        })
                        .then(() => {
                            sftp.fastGet(`${REMOTE_CORREUS}/${file.name}`, `${BACKUP_CORREUS}/${file.name}`)
                                .then(() => {
                                    sftp.delete(`${REMOTE_CORREUS}/${file.name}`)
                                        .then(() => {
                                            console.log(`Eliminat ${file.name} de CORREUS`);
                                        })
                                        .catch(err => {
                                            console.log(err);
                                        })
                                })
                        })
                } else {
                    console.log('No hi ha fitxers a Correus');
                }
            })
        })
        // FINISH CONNECTION 
        .finally(() => {
            console.log('Desconnectant del SFTP');
            sftp.end();
        });
}

createLocalFolder(LOCAL_TRM);
createLocalFolder(LOCAL_GPA);
createLocalFolder(LOCAL_ZBE);
createLocalFolder(LOCAL_CORREUS);
createLogs();
downloadFilesTest();




