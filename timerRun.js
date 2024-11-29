const cron = require('node-cron');
const { exec } = require('child_process');

function runTask() {
    const today = new Date();
    const dayOfWeek = today.getDay();

    //la funcion utilizado  en el cron de linux : 30 10 * * 1-5 /ruta/a/tu/script/runTask.sh
    // crontab -e en la terminal de linux 
    //crontab -l para verificar que este programada correctamente

    console.log('Iniciando tarea...');
    exec('node test-crono', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            console.log('Reintentando en 30 minutos...');
            setTimeout(runTask, 30 * 60 * 1000); // Reintento en 30 minutos
            return;
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
    });
}

// Programa la tarea para que se ejecute cada 24 horas
cron.schedule('*/3 * * * * *', () => {
    console.log('Ejecutando tarea programada...');
    runTask();
});

// Ejecuta la primera tarea inmediatamente
runTask();
