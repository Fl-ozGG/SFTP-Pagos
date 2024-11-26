const fs = require('fs');
const path = require('path');
require('dotenv').config();
const originRoute = process.env.LOCAL_CORREUS
const trmRoute = process.env.LOCAL_TRM;
const zbeRoute = process.env .LOCAL_ZBE
const tributes = [{tributeNumber:'149',tributePath:trmRoute},{tributeNumber:'026       ',tributePath:zbeRoute}]
let endingPath = 'C:/Users/igurrea/Desktop/Crea una carpeta'
function fileManager (){
//    '026       '
fs.readdir(originRoute, 'utf8',(err,unfilteredFile)=>{
    
    unfilteredFile.forEach((file) => {
        const unfilteredFilePath = path.join(originRoute, file); // Combina la ruta del directorio con el nombre del archivo
        

        fs.readFile(unfilteredFilePath,'utf8',(err,fileContent)=>{
            tributeFilter(fileContent,tributes)
        })

    });
    })

}

function tributeFilter(fileContent,tributes){
    tributes.forEach((tribute)=>{
        
        if(fileContent.match(tribute.tributeNumber)){
            console.log('el erchivo va en ', tribute.tributePath)    
        
        }
       
    }
)

}





fileManager()