const express = require('express');
const { check } = require('express-validator');
const { validarCampos } = require('../Midelwares/validarCampos');
const { validarJWTAdmin } = require('../Midelwares/validarJwtAdmin');
const { getTransactions, getTransactionById, getTransactionsByUser, confirmTransaction, rejectTransaction, deleteTransaction, createTransaction2, getTransactionsByFund } = require('../Controllers/transactions');
const { validarJWT } = require('../Midelwares/validarJwt');



const routerTrans = express.Router();

//esto es para crear una transaccion
routerTrans.post('/new-trans', [// para nuevo US 

    check("user", "el id del usuario obligatorio").not().isEmpty(),
    check("type", "falta tipo de transaccion si depocito o retiro").not().isEmpty(),
    check("amount", "el monto a cargar es obligatorio").not().isEmpty(),
    check("aliasBn", "el alias desde donde se hace la transaccion es obligatoria").not().isEmpty(),
    check("id_order", "el id_order es obligatorio").not().isEmpty(),
    check("mutualFundId", "el id de el fondo al que decea invertir es obligatorio").not().isEmpty(),
    
    validarCampos,
    validarJWT
  ], createTransaction2
  );

//routerTrans.get('/transtactions', getTransactions);// Get all transactions carga todos las transacciones
 
//routerTrans.get('/transactions/:id', getTransactionById); // Get a single transaction by ID carga una transaccion por id

routerTrans.get('/trans-us/:id',validarJWT, getTransactionsByUser); //carga un transaccion por usuario por id

routerTrans.get('/trans-fund/:id',validarJWTAdmin, getTransactionsByFund); //carga TRANSACCIONES POR FONDO
  
routerTrans.put('/trans-confirm',validarJWTAdmin, confirmTransaction);//confirmar transaccion

routerTrans.put('/trans-reject',validarJWTAdmin, rejectTransaction);//rechazar transaccion

//routerTrans.delete('/deleteTrans/:id', deleteTransaction); // Delete an investor by ID elimina la cuenta inversor

//aclaras que se exporta todo lo trabajado con router
module.exports = routerTrans;