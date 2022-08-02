let fs = require('fs');
require('dotenv').config();

const LOCAL_LOGS = process.env.LOCAL_LOGS;

function createLogs() {
    // CREATE THE FOLDER LOGS 
    fs.mkdir(LOCAL_LOGS, {
      recursive: true
    }, (err) => {
      if (err) throw err;
      console.log('Folder logs created');
    });
    // CREATE INSIDE THE FOLDER LOGS A FOLDER WITH THE CURRENT DATE
    let date = new Date();
    let folderDate = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    fs.mkdir(LOCAL_LOGS + '/' + folderDate, {
      recursive: true
    }, (err) => {
      if (err) throw err;
      console.log('Folder logs created');
    });
    // INSIDE THE FOLDER LOGS A FOLDER WITH THE CURRENT DATE, CREATE A LOG FILE TXT
    let logFile = LOCAL_LOGS + '/' + folderDate + '/' + folderDate + '.txt';
    fs.writeFile(logFile, '', (err) => {
      if (err) throw err;
      console.log('Log file created');
    });
  }

  module.exports = { createLogs };