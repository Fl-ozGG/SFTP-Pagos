function changeLastFourDigits(lineToCopy, lineToModify) {
  // Mantén todo excepto los últimos 4 caracteres de lineToModify
  let replacement = lineToCopy.slice(51);  // A partir del carácter 51 de lineToCopy
  let prefix = lineToModify.slice(0, 51);  // Los primeros 51 caracteres de lineToModify
  // Combina el prefijo con el reemplazo
  return prefix + replacement;
}

function replaceLastLane(indexToPut, arrOfLines, lineToPut) {
  arrOfLines[indexToPut] = lineToPut; // Reemplaza la línea en la posición dada
}

const datos = `          
  0470084013                  00000002000000000000003000                       026                    
  0470084013                  00000002000000000000003000                       026                    
  0470084013                  00000002000000000000003000                       026                    
  0470084013                  00000002000000000000003000                       026                    
  0470084013                  00000002000000000000012000                       026                    
  0570084013                  00000006000000000000000000                                              
`;

let lanesArr = datos.split('\n');  // Dividimos los datos en líneas
let lineToModify = lanesArr[lanesArr.length - 2]; // Última línea
let lineToCopy = lanesArr[lanesArr.length - 3];  // Penúltima línea
let finalLine = changeLastFourDigits(lineToCopy, lineToModify); // Cambiar los últimos 4 dígitos

let indexOfLastLine = lanesArr.length - 2; // Índice de la última línea
console.log(indexOfLastLine)
replaceLastLane(indexOfLastLine, lanesArr, finalLine); // Reemplazar la última línea

// Unir las líneas de nuevo para formar la cadena completa
let updatedDatos = lanesArr.join('\n');
console.log(updatedDatos)