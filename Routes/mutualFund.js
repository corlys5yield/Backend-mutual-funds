const express = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../Midelwares/validarCampos');
const { validarJWTAdmin } = require('../Midelwares/validarJwtAdmin');
const { createMutualFund, getAllMutualFundsDetails, addInvestorToMutualFund, addBetResultToMutualFund, getCurrentMutualFunds, finalizeMutualFund, retireInvestorFromMutualFund } = require('../Controllers/mutualFund');


const routerFound = express.Router();

//esto es para crear una transaccion
routerFound.post('/new-fund', [// para nuevo US 

    check("name", "el nombre del periodo del fondo es obligatorio").not().isEmpty(),
    check("startDate", "la fecha de inicio es obligatoria").not().isEmpty(),
    check("endDate", "la fecha de fin del periodo es obligatoria").not().isEmpty(),
    check("maxInvestors", "la cantidad maxima de inversores es necesaria").not().isEmpty(),
    check("minInvestmentAmount", "el monto minimo de la invercion es obligatorio").not().isEmpty(),
    
    validarCampos,
    validarJWTAdmin
  ], createMutualFund
  );

  // Añadir un inversor a un fondo común
routerFound.post('/add-investor/:mutualFundId', [
  check('user', 'El ID del usuario es obligatorio').not().isEmpty(),
  check('mount', 'El monto de la inversión es obligatorio').isNumeric(),
  validarCampos,
  validarJWTAdmin // Si solo administradores pueden añadir inversores
], addInvestorToMutualFund);

  // modifica con datos del retiro 
  routerFound.put('/retire-investor/:mutualFundId', [
    check('user', 'El ID del usuario es obligatorio').not().isEmpty(),
    check('amount', 'El monto de la inversión es obligatorio').isNumeric(),
    validarCampos,
    validarJWTAdmin // Si solo administradores pueden añadir inversores
  ],retireInvestorFromMutualFund );

 // Añadir resultados de las apuestas al fondo común
 routerFound.post('/add-betResult/:mutualFundId', [
  check('amount', 'El monto apostado es obligatorio').not().isEmpty(),
  check('earnings', 'el rendimiento es obligatorio').isNumeric(),
  validarCampos,
  validarJWTAdmin // Si solo administradores pueden añadir inversores
], addBetResultToMutualFund);


routerFound.get('/All-funds',validarJWTAdmin, getAllMutualFundsDetails );// Get all transactions carga todos los fondos activos

routerFound.put('/finalized',validarJWTAdmin, finalizeMutualFund);//lo vamos a usar para Deshabilitar al usuario inversor


module.exports = routerFound;