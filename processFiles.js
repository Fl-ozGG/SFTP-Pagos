const fs = require('fs');
const path = require('path');
require('dotenv').config();

const LOCAL_CORREUS = process.env.LOCAL_CORREUS;


//determinar tributo y enviar los archivos al folder adecuado
function processFiles(folderPath) {
    // Leer el contenido del directorio
    fs.readdir(folderPath, (err, files) => {
        if (err) {
            console.error('Error al leer el directorio:', err);
            return;
        }

        // Filtrar solo archivos .txt
        const archivosTxt = files.filter(file => path.extname(file) === '.txt');

        archivosTxt.forEach(file => {
            const filePath = path.join(folderPath, file);

            // Leer el archivo una vez
            fs.readFile(filePath, 'utf8', (err, data) => {
                if (err) {
                    console.error(`Error al leer el archivo ${file}:`, err);
                    return;
                }

                let moved = false;
                
                // Iterar por los tributos para determinar acción
                const tributes = ["149", "026"];
                for (let tribute of tributes) {
                    if (tributeDetector(data, tribute)) {
                        moveFiles(filePath, tribute); // Pasar ruta completa
                        moved = true; // Marcar como movido
                        break; // Detener la iteración si ya se movió
                    }
                    console.log(moved)
                }

                // Si no coincide con ningún tributo, eliminar el archivo
                if (!moved) {
                    fs.unlink(filePath, (err) => {
                        if (err) {
                            console.error(`Error al eliminar el archivo ${file}:`, err);
                        } else {
                            console.log(`Archivo ${file} eliminado.`);
                        }
                    });
                }
            });
        });
    });
}
function tributeDetector(data, tribute){
    const regex = new RegExp(`\\b${tribute}\\b`);
    const isTrm = regex.test(data);
    
    return isTrm
}

function moveFiles(filePath, tribute) {
    const fileName = path.basename(filePath); // Obtener solo el nombre del archivo
    let rutaDestino = 'F:/Intercambios/0_SFTP - Fitxers Caixa';

    // Determinar la subcarpeta de destino en función del valor de tribute
    if (tribute === "149") {
        rutaDestino = path.join(rutaDestino, 'TRM - 149');
    } else if (tribute === "026") {
        rutaDestino = path.join(rutaDestino, 'ZBE - 026');
    }

    // Crear la carpeta de destino si no existe

    const rutaArchivoDestino = path.join(rutaDestino, fileName);

    // Mover el archivo
    fs.rename(filePath, rutaArchivoDestino, (err) => {
        if (err) {
            console.error('Error al mover el archivo:', err);
        } else {
            console.log(`Archivo ${fileName} movido a ${rutaDestino}.`);
        }
    });
}

function testZBE() {
    fs.readFile('C:/Users/igurrea/Desktop/archivo test 026-2.txt', 'utf8', (err, data) => {
        if (err) {
          console.error('Error al leer el archivo:', err);
          return;
        }

        // Dividir el contenido en líneas, respetando los saltos de línea
        const lines = data.split(/\r?\n/);  // Usamos split sin eliminar los saltos de línea

        // Verificar que hay suficientes líneas para procesar
        if (lines.length <= 3) {
            console.log('El archivo no tiene suficientes líneas para eliminar las primeras dos y la última.');
            return;
        }

        // Mantener las dos primeras líneas y la última línea sin cambios
        const firstTwoLines = lines.slice(0, 2); // Las dos primeras líneas
        const lastLine = lines[lines.length - 1]; // La última línea

        // Filtrar las líneas intermedias (sin las dos primeras ni la última)
        const filteredLines = lines.slice(2, lines.length - 1).filter(line => {
            const blocks = line.split(/\s+/);  // Dividir la línea en bloques
            return blocks[blocks.length - 1].includes('026');  // Verificar si el último bloque contiene "026"
        });

        // Contar las líneas totales (todas las líneas después del procesamiento)
        const totalLines = firstTwoLines.length + filteredLines.length + 1;  // 1 para la última línea

        // Crear el nuevo número con el formato requerido (con ceros a la izquierda si es necesario)
        const formattedNumber = String(totalLines).padStart(2, '0'); // Asegurar que tenga al menos 2 dígitos

        // Modificar la última línea con el nuevo número
        const lastLineBlocks = lastLine.split(/\s+/);
        lastLineBlocks[1] = `000000${formattedNumber}000000000000086292`;

        // Reconstruir la última línea con el nuevo bloque
        const modifiedLastLine = lastLineBlocks.join(' ');

        // Unificar las líneas (manteniendo las primeras dos y la última) con las líneas filtradas
        const finalLines = [...firstTwoLines, ...filteredLines, modifiedLastLine];

        // Guardar el resultado filtrado en un nuevo archivo
        fs.writeFile('C:/Users/igurrea/Desktop/PROYECTOS/PAGOS-APP/pagos-TEST/archivo_filtrado.txt', finalLines.join('\n'), (err) => {
            if (err) {
                console.error('Error al escribir el archivo:', err);
            } else {
                console.log('Archivo filtrado guardado como archivo_filtrado.txt');
            }
        });
    });
}



processFiles(LOCAL_CORREUS)
