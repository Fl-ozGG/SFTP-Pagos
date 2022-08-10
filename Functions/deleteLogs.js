let fs = require('fs');
require('dotenv').config();
const LOCAL_LOGS = process.env.LOCAL_LOGS;

export function deleteLogs() {
    console.log('********************************************************************************************************************');
    fs.readdir(LOCAL_LOGS, (err, files) => {
        if (err) throw err;
        if (files.length > 300) {
            for (let i = 0; i < 100; i++) {
                fs.unlink(LOCAL_LOGS + files[i], (err) => {
                    if (err) throw err;
                });
            }
        }
    });
}



