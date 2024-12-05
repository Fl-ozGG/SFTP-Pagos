const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Ruta de la carpeta
const carpeta = 'C:/Users/igurrea/Desktop/backup de correus/Crea una carpeta';

// Lee el contenido de la carpeta
fs.readdir(carpeta, (err, archivos) => {
  if (err) {
    console.error('Error al leer la carpeta:', err);
    return;
  }

  // Filtra solo los archivos (si quieres excluir subdirectorios)
  archivos.forEach(archivo => {

    const rutaCompleta = path.join(carpeta, archivo);
    fs.stat(rutaCompleta, (err, stats) => {
      if (err) {
        console.error('Error al obtener información del archivo:', err);
        return;
      }
      if (stats.isFile()) {
        // Si es un archivo, lo leemos
        fs.readFile(rutaCompleta, 'utf8', (err, data) => {

          let lineas = data.split('\n');
          let numFinal;
          let lineaInsertar;

          // Encuentra el número final y genera la nueva línea a insertar
          lineas.forEach((linea, index) => {
            if (linea == lineas[lineas.length - 3]) {
              numFinal = linea.slice(49, 54);
              lineaInsertar = lineas[lineas.length - 2].slice(0, 49) + numFinal + '                                              \r'
              console.log(numFinal)
              // aqui quiero añadir la logica necesaria para que escriba en mi archivo txt la variable lineaInsertar, reemplazando la linea anterior que hubiese en este indice
              lineas[lineas.length - 2] = lineaInsertar

              const texto = lineas.join('\n'); // Esto los separará por espacios, usa '\n' para nuevas líneas

              // Escribir el texto a un archivo
              fs.writeFile(rutaCompleta, texto, (err) => {
                if (err) {
                  console.error('Error al escribir el archivo:', err);
                } else {
                  console.log('Archivo guardado correctamente.');
                }
              });


            }
          });
          console.log(lineas)


        });
      }
    });
  });
});


