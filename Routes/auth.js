const express = require('express');
const {  createUser, loginUser} = require('../Controllers/auth');

const { check } = require('express-validator');
const { validarCampos } = require('../Midelwares/validarCampos');

//const { validarJWTAdmin } = require('../Midelwares/validarJwtAdmin');
const routerAuth = express.Router();

//auth de autenticacion en general para todos


 routerAuth.post('/new', [// para nuevo US 
  
  check("userName", "el nombre de usuario es obligatorio").not().isEmpty(),
  check("aliasBN", "el Alias de Binance es obligatorio").not().isEmpty(),
  check("password", "el password debe tener al menos 4 caracteres").isLength({
      min: 4,
  }),
  validarCampos,
  
], createUser);


//para logear usuario
routerAuth.post('/login',
  [ //cuando usamos varios midelwar van dentro de corchetes verifican que los campos existan y despues va recien el validar

      check("userName", "userName obligatorio").not().isEmpty(),
      check("password", "passwordd obligatoria").not().isEmpty(),//contraseña obligatoria
      validarCampos

  ], loginUser);


module.exports = routerAuth;