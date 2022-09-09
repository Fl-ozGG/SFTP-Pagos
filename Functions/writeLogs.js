// Funció per escriure logs
function writeLog(text) {
    fs.appendFile(`${LOCAL_LOGS}/${global.fileName}`, `${actualHour}-${text}\n`, (err) => {
        if (err) throw err;
    });
}

exports = module.exports = {
    writeLog
}