//const Producto = require('../models/producto-model');
const bcryptjs = require ('bcrypt');

const User = require('../Models/Users');
const PeriodPercentage = require('../Models/PeriodPercentage');


//deshabilitar usuario
const disabledUser = async (req, res) => {

    try {
        const usuarioInactivo = await User.findById(req.body._id); //recibe el id

        if (!usuarioInactivo) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ningun usuario con este Id',
            });
        }

        usuarioInactivo.status = 'disabled';//deshabilitado

        await usuarioInactivo.save();

        res.status(200).json({
            ok: true,
            msg: 'usuario deshabilitado',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'hable con el administrador',
        });
    }
};

const activateUser = async (req, res) => {

    try {
        const usuarioInactivo = await User.findById(req.body._id); //recibe el id

        if (!usuarioInactivo) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ningun usuario con este Id',
            });
        }

        usuarioInactivo.status = 'active';//activo

        await usuarioInactivo.save();

        res.status(200).json({
            ok: true,
            msg: 'usuario deshabilitado',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'hable con el administrador',
        });
    }
};

//cargar usuarios
const loadUsers = async (req, res) => {

    try {

        const users = await User.find();

        res.status(200).json({
            ok: true,
            msg: "usuarios cargados",
            users,

        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            msg: "contactese con el administrador",
        })
    }
};

//crga un usuario por id
const getUserById = async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'Usuario no encontrado ' });
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const editUser = async (req, res) => {
    try {
        const userEdit = await User.findById(req.body._id);

        if (!userEdit) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ningún Usuario con este Id',
            });
        }

        // Verificar si la contraseña viene encriptada
        if (req.body.password && req.body.password.length < 60) {
            // Si la longitud de la contraseña es menor a 60, se asume que no está encriptada
            const salt = bcryptjs.genSaltSync();
            req.body.password = bcryptjs.hashSync(req.body.password, salt);
        }

        await User.findByIdAndUpdate(req.body._id, req.body);

        res.status(200).json({
            ok: true,
            msg: 'Usuario editado',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'Comuníquese con el administrador',
        });
    }
};

const deleteUser = async (req, res) => {

    //aqui va la logica de eliminar producto

    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe un usuario con este ID',
            });
        }

        await User.findByIdAndDelete(req.params.id);

        res.status(200).json({
            ok: true,
            msg: 'Usuario Eliminado',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'hable con el administrador',
        });
    }
};

const addPeriodPercentage = async (req, res) => {
    const { endPeriod, percentage } = req.body;

    try {
        // Verificar si ya existe un registro con la misma fecha de fin de periodo
        let period = await PeriodPercentage.findOne({ endPeriod });

        if (period) {
            return res.status(400).json({
                ok: false,
                msg: "Ya existe un registro con esa fecha de fin de período"
            });
        }

        // Crear un nuevo registro con los datos proporcionados
        period = new PeriodPercentage({
            endPeriod,
            percentage
        });

        await period.save();

        res.status(201).json({
            ok: true,
            period,
            msg: 'El registro de porcentaje de período se guardó correctamente',
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Por favor, contactarse con el administrador"
        });
    }
};


module.exports = {
    
    disabledUser,
    activateUser,
    loadUsers,
    getUserById,
    editUser,
    deleteUser,
    addPeriodPercentage,
    

};