const bcryptjs = require ('bcrypt')
const jwt = require("jsonwebtoken");

const User = require('../Models/Users');

 // Asegúrate de que la ruta sea correcta

 const createUser = async (req, res) => {

    const { userName, password, aliasBN } = req.body;

    try {

        let user = await User.findOne({ aliasBN })

        if (user) {
            return res.status(400).json({
                ok: false,
                msg: "un usuario ya existe con ese alias de binance"
            })
        }
        user = new User(req.body);
        console.log(user);
        //encriptacion de contraseñas
        const salt = bcryptjs.genSaltSync(10);
        user.password = bcryptjs.hashSync(password, salt);

        await user.save();

        //generar nuestro JWT
        //se lo genera en el back y se guardara en el front en el localstorage
        const payload = {
            id: user._id,
            userName: user.userName,
            aliasBN: user.aliasBN,
            rol: user.rol,
        };

        const token = jwt.sign(payload, process.env.SECRET_JWT, {
            expiresIn: "2h",
        });

        res.status(201).json({
            ok: true,
            id: user._id,
            userName: user.name,
            rol: user.rol,
            token,
            msg: 'el usuario se guardo correctamente',

        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "por favor contactarse cono  el administrador"
        })
    }
}

const loginUser = async (req, res) => {

    
    const { userName, password } = req.body;


    try {

        let user = await User.findOne({ userName })

        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: "el nombre de usuario o la contraseña no son validas"
            })
        }

        const validarpassword = bcryptjs.compareSync(password, user.password);

        if (!validarpassword) {
            return res.status(400).json({
                ok: false,
                msg: 'el nombre de usuario o la contraseña no son validas'
            });
        }

        if (user.status != 'active') {
            return res.status(400).json({
                ok: false,
                msg: 'usted esta inhabilitado, contactese con el administrador'
            });
        }

        //generar nuestro JWT
        const payload = {
            id: user._id,
            userName: user.userName,
            aliasBN: user.aliasBN,
            rol: user.rol,//tomamos el rol
            status:user.status, // tomamos el estado
        };

        const token = jwt.sign(payload, process.env.SECRET_JWT, {
            expiresIn: "2h",
        });

        res.status(201).json({
            ok: true,
            id: user._id,
            userName: user.name,
            rol: user.rol,
            status:user.status,
            token,
            msg: 'el usario se logueo correctamente',
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "por favor contactarse con el administrador"
        })
    }
}






module.exports = {
    createUser,
    loginUser,
    //validarCorreo,
    //RestablecerPassword,
};