
const express = require('express')
const { dbConeccion } = require('./db/config');
require('dotenv').config();
const cors= require("cors");
const app= express();

//llamar al servidor
app.listen(process.env.PORT, ()=>{
    console.log(`server corriendo en ${process.env.PORT}`)
})


//base de datos
dbConeccion();
  

//cors
app.use(cors());

//directorio publico
app.use(express.static('public'));

// Middleware para parsear JSON
//lectura y parseo del body
app.use(express.json());

//para los estudios contables o usuarios en general
app.use("/auth",require('./Routes/auth'))

//para el admin
app.use("/admin",require('./Routes/admin'))


//para fondos comunes
app.use("/funds", require('./Routes/mutualFund'));

//ruta para transacciones
app.use("/transactions", require('./Routes/transactions'));
