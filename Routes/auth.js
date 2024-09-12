const express = require('express');
const {  createUser, loginUser, getUserMutualFunds, getAllPeriodPercentages} = require('../Controllers/auth');

const { check } = require('express-validator');
const { validarCampos } = require('../Midelwares/validarCampos');
const { validarJWT } = require('../Midelwares/validarJwt');

//const { validarJWTAdmin } = require('../Midelwares/validarJwtAdmin');
const routerAuth = express.Router();

//auth de autenticacion en general para todos


 routerAuth.post('/new', [// para nuevo US 

  check("email", "el email es obligatorio").not().isEmpty(),
  check("userName", "el nombres obligatorio").not().isEmpty(),
  check("lastName", "el apellido es obligatorio").not().isEmpty(),
  check("password", "el password debe tener al menos 4 caracteres").isLength({
      min: 4,
  }),
  validarCampos,
  
], createUser
);


//para logear usuario
routerAuth.post('/login',
  [ //cuando usamos varios midelwar van dentro de corchetes verifican que los campos existan y despues va recien el validar

    check("email", "el email es obligatorio").not().isEmpty(),
      check("password", "passwordd obligatoria").not().isEmpty(),//contraseña obligatoria
      validarCampos

  ], loginUser);

  routerAuth.get('/funds-Us',validarJWT ,getUserMutualFunds );// Get all transactions carga todos las transacciones 
  
  routerAuth.get('/All-percentage', getAllPeriodPercentages );// Get all transactions carga todos los fondos activos


module.exports = routerAuth;