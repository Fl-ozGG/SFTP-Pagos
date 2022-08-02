let Client = require('ssh2-sftp-client');
let sftp = new Client();
let fs = require('fs');
require('dotenv').config();

// VARIABLES DE ENTORNO
let REMOTE_TRM = process.env.REMOTE_TRM;
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

// CREAR CARPETAS DE LOS TITULOS SI NO EXISTEN
function createFoldersIfDoesntExist() {
    // CREAR TRM IF NOT EXISTS
    fs.access(LOCAL_TRM, (error) => {
        if (error) {
            fs.mkdirSync({
                LOCAL_TRM
            });
        } else {
        }
    });
    // CREAR GPA IF NOT EXISTS
    fs.access(LOCAL_GPA, (error) => {
        if (error) {
            fs.mkdirSync(LOCAL_GPA);
        } else {
        }
    })
    // CREAR ZBE IF NOT EXISTS
    fs.access(LOCAL_ZBE, (error) => {
        if (error) {
            fs.mkdirSync(LOCAL_ZBE);
        } else {
        }
    })
    // CREAR CORREUS IF NOT EXISTS
    fs.access(LOCAL_CORREUS, (error) => {
        if (error) {
            fs.mkdirSync(LOCAL_CORREUS);
        } else {
        }
    })
}

// FUNCION PARA CREAR CARPETA LOGS Y ARCHIVO CON YYMMDD COMO NOMBRE
function createLogs() {
    // CREATE THE FOLDER LOGS 
    fs.mkdir(LOCAL_LOGS, {
        recursive: true
    }, (err) => {
        if (err) throw err;
    });
    // CREATE A FILE WITH THE DATE AS A NAME if not exists
    fileName = actualDate;
    global.fileName = fileName;
    fs.writeFile(LOCAL_LOGS + '/' + fileName, '', (err) => {
        if (err) throw err;
    });
}

// FUNCION PARA ESCRIBIR EN EL LOG
function writeLog(text) {
    fs.appendFile(LOCAL_LOGS + '/' + global.fileName, actualHour + ' - ' + text + '\n', (err) => {
        if (err) throw err;
    });
}

// FUNCION PARA DESCARGAR ARCHIVOS
function downloadFiles() {
    // Connect SFTP
    sftp.connect(config)
        .then(() => {
            writeLog('Connected to SFTP');
            return sftp.list(REMOTE_TRM);
        })
        .then(files => {
            files.forEach(file => {
                if (file.name != 'Backup') {
                    sftp.fastGet(REMOTE_TRM + '/' + file.name, LOCAL_TRM + '/' + file.name)
                        .then(() => {
                            writeLog('Downloaded ' + file.name + 'from TRM');
                        })
                        .catch(err => {
                            writeLog(err);
                        })
                        .then(() => {
                            sftp.fastPut(LOCAL_TRM + '/' + file.name, REMOTE_TRM + '/Backup/' + file.name)
                                .then(() => {
                                    sftp.delete(REMOTE_TRM + '/' + file.name)
                                        .then(() => {
                                            writeLog('File ' + file.name + ' deleted from TRM');
                                        })
                                        .catch(err => {
                                            writeLog(err);
                                        })
                                })
                        })
                }
            })
        })
        // DOWNLOAD GPA - MOVE TO BACKUP - DELETE ORIGINAL FILES FROM ROOT
        .then(() => {
            return sftp.list(REMOTE_GPA);
        })
        .then(files => {
            files.forEach(file => {
                if (file.name != 'Backup')
                    sftp.fastGet(REMOTE_GPA + '/' + file.name, LOCAL_GPA + '/' + file.name)
                        .then(() => {
                            writeLog('Downloaded ' + file.name + 'from GPA');
                        })
                        .catch(err => {
                            writeLog(err);
                        })
                        .then(() => {
                            sftp.fastPut(LOCAL_GPA + '/' + file.name, REMOTE_GPA + '/Backup/' + file.name)
                                .then(() => {
                                    sftp.delete(REMOTE_GPA + '/' + file.name)
                                        .then(() => {
                                            writeLog('Deleted ' + file.name);
                                        })
                                        .catch(err => {
                                            writeLog(err);
                                        })
                                })
                        })
            })
        })
        // DOWNLOAD ZBE - MOVE TO BACKUP - DELETE ORIGINAL FILES FROM ROOT
        .then(() => {
            return sftp.list(REMOTE_ZBE);
        })
        .then(files => {
            files.forEach(file => {
                if (file.name != 'Backup') {
                    sftp.fastGet(REMOTE_ZBE + '/' + file.name, LOCAL_ZBE + '/' + file.name)
                        .then(() => {
                            writeLog('Downloaded ' + file.name + 'from ZBE');
                        })
                        .catch(err => {
                            writeLog(err);
                        })
                        .then(() => {
                            sftp.fastPut(LOCAL_ZBE + '/' + file.name, REMOTE_ZBE + '/Backup/' + file.name)
                                .then(() => {
                                    sftp.delete(REMOTE_ZBE + '/' + file.name)
                                        .then(() => {
                                            writeLog('Deleted ' + file.name);
                                        })
                                        .catch(err => {
                                            writeLog(err);
                                        })
                                })
                        })
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
                if (file.name != 'Backup') {
                    sftp.fastGet(REMOTE_CORREUS + '/' + file.name, LOCAL_CORREUS + '/' + file.name)
                        .then(() => {
                            writeLog('Downloaded ' + file.name + 'from CORREUS');
                        })
                        .catch(err => {
                            writeLog(err);
                        })
                        .then(() => {
                            sftp.fastPut(LOCAL_CORREUS + '/' + file.name, REMOTE_CORREUS + '/Backup/' + file.name)
                                .then(() => {
                                    sftp.delete(REMOTE_CORREUS + '/' + file.name)
                                        .then(() => {
                                            writeLog('Deleted ' + file.name);
                                        })
                                        .catch(err => {
                                            writeLog(err);
                                        })
                                })
                        })
                } else {
                    writeLog('No files to download');
                }
            })
        })
        // FINISH CONNECTION 
        .then(() => {
            writeLog('Disconnecting from server');
            sftp.end();
        });
}
    

createFoldersIfDoesntExist();
createLogs();
downloadFiles();

// END OF PROGRAM









