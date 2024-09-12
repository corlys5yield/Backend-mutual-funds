const express = require('express');
//const { crearProducto, editarProducto, eliminarProducto, cargarProducto, cargarUsuarios, cargarPedidos, confirmarPedido, inhabilitarUsuario, cargarProducto_Aleatorio } = require('../controllers/admin');
const { check } = require('express-validator');
const { validarCampos } = require('../Midelwares/validarCampos');
const { validarJWTAdmin } = require('../Midelwares/validarJwtAdmin');
const { disabledUser, loadUsers, getUserById, editUser, activateUser, deleteUser, addPeriodPercentage } = require('../Controllers/admin');

const routerAdmin = express.Router();

//faltan metodos de validar token de admin
routerAdmin.put('/disabled',validarJWTAdmin, disabledUser);//lo vamos a usar para Deshabilitar al usuario inversor

routerAdmin.put('/activateUs',validarJWTAdmin, activateUser);//lo vamos a usar para abilitar al usuario inversor

routerAdmin.get('/users',validarJWTAdmin, loadUsers );//carga todos los usuarios

routerAdmin.get('/users/:id',validarJWTAdmin, getUserById);//toma al usuario pasando la id

routerAdmin.put('/updateUser',validarJWTAdmin, [// para editar el usuario 

  check("email", "el email es obligatorio").not().isEmpty(),
  check("userName", "el nombres obligatorio").not().isEmpty(),
  check("lastName", "el apellido es obligatorio").not().isEmpty(),
  check("rol", "el rol es obligatorio").not().isEmpty(),
  check("password", "el password debe tener al menos 4 caracteres").isLength({
      min: 4,
  }),
  validarCampos,
  
], editUser
);

routerAdmin.post('/add-porcentagePeriod',validarJWTAdmin, [// para editar el usuario 

  check("endPeriod", "la fecha al finalizar el periodo es obligatoria").not().isEmpty(),
  check("percentage", "el porcentaje del mes es obligatorio").not().isEmpty(),
  
  validarCampos,
  
], addPeriodPercentage
);



routerAdmin.delete('/delUs/:id',validarJWTAdmin,  deleteUser);//eliminar el usuario

//aclaras que se exporta todo lo trabajado con router
module.exports = routerAdmin;