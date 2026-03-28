const express = require('express');

const multer = require('multer');

const fs = require('fs');

const csv = require('csv-parser');

const cors = require('cors');

const path = require('path');


const app = express();

const port = 3000

app.use(cors());

app.use(express.json());

const upload = multer({dest:'uploads/'});

let uploadedData= [];


// =====================================================
// 📤 ENDPOINT: SUBIR ARCHIVO CSV
// ====================================================

app.post('/upload',upload.single('file'), (req,res)=>{

    const filePath = req.file.path;

    uploadedData = [];

    fs.createReadStream(filePath)
      .pipe(csv()) 
      .on('data', (row)=>{
        uploadedData.push(row);
      })
      .on('end',()=>{
        const newPath = `uploads/${req.file.originalname}`;

        fs.renameSync(filePath,newPath);
        res.json({
            message:'Archivo procesado exitosamente',
            totalRows:uploadedData.length,
        })

        console.log('Carga Exitosa..');
      })

      .on('error',(error)=>{
        console.error('Error CSV',error);

        res.status(500).json({
            error:'Error procesando el archivo CSV'
        })

      })

})

// =====================================================
// 📄 ENDPOINT: OBTENER DATOS PAGINADOS
// =====================================================


app.get("/data",(req, res)=>{
    
    const page = parseInt(req.query.page) || 1;

    const limit = parseInt(req.query.limit) || 100;

    const start = (page - 1) * limit;

    const end = start + limit;

    const pageData =  uploadedData.slice(start, end);

    const totalPages = Math.ceil(uploadedData.length / limit);

    res.json({
        currentPage:page,
        totalPages,totalRows:uploadedData.length,
        data:pageData
    })

});

// =====================================================
// 🗑️ ENDPOINT: LIMPIAR DATOS Y ARCHIVOS
// =====================================================

app.delete('/clear',(req,res)=>{

    uploadedData = [];

    const uploadDir = path.join(__dirname,'uploads');

    fs.readdir(uploadDir,(err,files)=>{

        if(err){

            return res.status(500).json({
                error:'Error leyendo carpeta de uploads'
            })

        }

        files.forEach( file => {

            fs.unlink(path.join(uploadDir,file), err =>{
                if(err) console.error('Error borrando archivo', file)
            })
       
        })

        return res.json({
            message:'Datos y archivos eliminados exitosamente'
        })

    })

    console.log('Se eliminaron los registros correctamente..')


})


app.listen(port, ()=>{
    console.log(`Servidor corriendo en http://localhost:${port}`);
});

