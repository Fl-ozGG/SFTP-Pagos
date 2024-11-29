const fs = require('fs');
const readline = require('readline');
const path = require('path');

async function modificarArchivoIgnorandoLineas(rutaArchivo, modificarLinea, modificarUltimaLinea) {

  const tempFile = `${rutaArchivo}.tmp`; // Archivo temporal para escritura
  const lineas = []; // Array para almacenar las líneas
  let totalLineas = 0;

  const rl = readline.createInterface({
    input: fs.createReadStream(rutaArchivo),
    terminal: false,
  });

  rl.on('line', (line) => {
    lineas.push(line); // Almacenar cada línea en el array
    totalLineas++;
  });

  rl.on('close', async () => {

    const lineasModificadas = lineas.map((line, index) => {
      // Ignorar las dos primeras líneas y la última
      if (index < 2 || index === lineas.length - 1) {
        return line; // Dejar la línea sin cambios
      }

      // Modificar las líneas, eliminando las que no contienen "026"
      return modificarLinea(line);
    }).filter(line => line !== null); // Filtrar las líneas null (eliminadas)

    try {
      const writeStream = fs.createWriteStream(tempFile, 'utf8');

      lineasModificadas.forEach(line => {
        writeStream.write(line + '\n');
      });

      writeStream.end();

      writeStream.on('finish', () => {
        try {
          fs.renameSync(tempFile, rutaArchivo); // Renombrar el archivo temporal al original
          console.log('Archivo nombrado correctamente.');

          // Leer las líneas del archivo modificado
          leerArchivo(rutaArchivo, lineasModificadas);
        } catch (err) {
          console.error(`Error al renombrar el archivo: ${err.message}`);
          if (fs.existsSync(tempFile)) {
            fs.unlinkSync(tempFile); // Eliminar el archivo temporal en caso de error
          }
        }
      });
    } catch (err) {
      console.error(`Error al escribir en el archivo temporal: ${err.message}`);
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile); // Eliminar el archivo temporal en caso de error
      }
    }
  });

  rl.on('error', (err) => {
    console.error(`Error al leer el archivo: ${err.message}`);
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile); // Eliminar el archivo temporal en caso de error
    }
  });
}

// Función que define cómo modificar cada línea
function modificarLinea(line) {
  if (line.includes(' 026')) {
    // retornar la línea solo si contiene "026"
    return line;
  }
  // Si no contiene "026", eliminarla
  return null;
}

// Función para leer las líneas del archivo modificado
function leerArchivo(rutaArchivo, lineasModificadas) {
  const rl = readline.createInterface({
    input: fs.createReadStream(rutaArchivo),
    terminal: false,
  });

  const lineasLeidas = [];

  rl.on('line', (line) => {
    lineasLeidas.push(line); // Almacenar las líneas leídas
  });

  rl.on('close', () => {


    // Modificar la última línea
    const ultimaLinea = lineasLeidas[lineasLeidas.length - 1];
    const numeroFinal = (lineasLeidas.length - 4) * 500; // Calcular el número final
    const nuevaUltimaLinea = modificarUltimaLinea(ultimaLinea, lineasLeidas.length, numeroFinal);

    // Reemplazar la última línea modificada
    lineasLeidas[lineasLeidas.length - 1] = nuevaUltimaLinea;

    console.log('Última línea modificada');

    // Escribir las líneas modificadas al archivo
    escribirArchivoModificado(rutaArchivo, lineasLeidas);
  });

  rl.on('error', (err) => {
    console.error(`Error al leer el archivo: ${err.message}`);
  });
}

// Función para escribir las líneas modificadas al archivo
function escribirArchivoModificado(rutaArchivo, lineasLeidas) {
  const tempFile = `${rutaArchivo}.tmp`; // Archivo temporal para escritura
  const writeStream = fs.createWriteStream(tempFile, 'utf8');

  lineasLeidas.forEach(line => {
    writeStream.write(line + '\n');
  });

  writeStream.end();

  writeStream.on('finish', () => {
    try {
      fs.renameSync(tempFile, rutaArchivo); // Renombrar el archivo temporal al original
      console.log('Archivo modificado correctamente con la última línea actualizada.');
    } catch (err) {
      console.error(`Error al renombrar el archivo: ${err.message}`);
      if (fs.existsSync(tempFile)) {
        fs.unlinkSync(tempFile); // Eliminar el archivo temporal en caso de error
      }
    }
  });

  writeStream.on('error', (err) => {
    console.error(`Error al escribir en el archivo temporal: ${err.message}`);
  });
}

// Función que modifica la última línea
function modificarUltimaLinea(linea, totalLineas, numeroFinal) {
  const longitudLinea = linea.length;

  // Modificar el número de líneas (en el índice 33) y asegurarse de que tenga 3 dígitos
  const inicioNumeroLineas = 33;  // Posición donde comienza el número '044'
  let nuevoNumeroLineas = totalLineas.toString().padStart(3, '0'); // Asegurarnos que el número tendrá 3 dígitos
  let lineaModificada = linea.slice(0, inicioNumeroLineas) + nuevoNumeroLineas + linea.slice(inicioNumeroLineas + 3);

  // Modificar el número final (en el índice 48) y asegurarse de que tenga 6 dígitos
  const inicioNumeroFinal = 48;  // Posición donde empieza el número final '095533'
  let nuevoNumeroFinal = numeroFinal.toString().padStart(6, '0'); // Asegurarse de que tenga 6 dígitos

  // Asegurarse de que el número final se inserte correctamente sin sobrescribir espacios innecesarios
  // Insertamos el número final en el lugar adecuado, manteniendo los espacios intactos.
  lineaModificada = lineaModificada.slice(0, inicioNumeroFinal) + nuevoNumeroFinal + lineaModificada.slice(inicioNumeroFinal + 6);

  // Verificación adicional para confirmar que la longitud no ha cambiado
  if (lineaModificada.length !== longitudLinea) {
    throw new Error("La longitud de la línea ha cambiado inesperadamente.");
  }

  return lineaModificada;
}


// Llamar a la función
const ruta = 'F:/Intercambios/0_SFTP - Fitxers Caixa/ZBE - 026/CTE00282_20241129034129_C602_01.txt.txt';
//modificarArchivoIgnorandoLineas(ruta, modificarLinea, modificarUltimaLinea);




//-------------------------------------------------------

function obtenerRutasTxt(carpetaRuta) {
  const rutasTxt = [];

  try {
    // Leer el contenido de la carpeta
    const archivos = fs.readdirSync(carpetaRuta);

    archivos.forEach((archivo) => {
      const archivoRuta = path.join(carpetaRuta, archivo);

      // Comprobar si es un archivo
      if (fs.statSync(archivoRuta).isFile() && path.extname(archivo).toLowerCase() === '.txt') {
        rutasTxt.push(archivoRuta);
      }
    });
  } catch (error) {
    console.error(`Error leyendo la carpeta: ${error.message}`);
  }

  return rutasTxt;
}

// Ejemplo de uso
const carpeta = 'C:/Users/igurrea/Desktop/FAKE-SFTP-Tresoreria/REMOTE/ZBE - 026 - REMOTE - TEST'; // Cambia esto por la ruta de tu carpeta
const txtArchivos = obtenerRutasTxt(carpeta);

//console.log('Archivos .txt encontrados:', txtArchivos);
txtArchivos.forEach((archivoZBE) => {
  modificarArchivoIgnorandoLineas(archivoZBE, modificarLinea, modificarUltimaLinea);
})