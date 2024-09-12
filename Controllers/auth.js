const bcryptjs = require ('bcrypt');
const jwt = require("jsonwebtoken");
const User = require('../Models/Users');
const MutualFund = require('../Models/MutualFund');
const PeriodPercentage = require('../Models/PeriodPercentage');

 // Asegúrate de que la ruta sea correcta

 const createUser = async (req, res) => {

    const {email, userName, lastName, password } = req.body;

    try {

        let user = await User.findOne({ email })

        if (user) {
            return res.status(400).json({
                ok: false,
                msg: "un usuario ya existe con ese email"
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
            email:user.email,
            userName: user.userName,
            lastName: user.lastName,
            rol: user.rol,
        };

        const token = jwt.sign(payload, process.env.SECRET_JWT, {
            expiresIn: "2h",
        });

        res.status(201).json({
            ok: true,
            id: user._id,
            email:user.email,
            userName: user.userName,
            lastName: user.lastName,
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

    
    const { email, password } = req.body;


    try {

        let user = await User.findOne({ email })

        if (!user) {
            return res.status(400).json({
                ok: false,
                msg: "el email o la contraseña no son validas"
            })
        }

        const validarpassword = bcryptjs.compareSync(password, user.password);

        if (!validarpassword) {
            return res.status(400).json({
                ok: false,
                msg: 'el email o la contraseña no son validas'
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
            email:user.email,
            userName: user.userName,
            lastName: user.lastName,
            rol: user.rol,//tomamos el rol
            status:user.status, // tomamos el estado
            user
        };

        const token = jwt.sign(payload, process.env.SECRET_JWT, {
            expiresIn: "2h",
        });

        res.status(201).json({
            ok: true,
            id: user._id,
            email:user.email,
            userName: user.userName,
            lastName: user.lastName,
            rol: user.rol,//tomamos el rol
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

const getUserMutualFunds = async (req, res) => {
    try {
        // Obtén el ID del usuario de los parámetros de consulta
        const userId = req.query.userId;

        // Valida que el ID del usuario sea una cadena de 24 caracteres hexadecimales
        if (!userId || typeof userId !== 'string' || !userId.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({
                ok: false,
                msg: 'ID de usuario inválido',
            });
        }

        // Encuentra todos los fondos que están en estado 'current'
        const currentFunds = await MutualFund.find({ status: 'current' })
            .populate('investors.user', 'name') // Puedes ajustar los campos a los que necesitas
            .populate('betHistory');

        // Encuentra todos los fondos en los que el usuario haya invertido
        const userFunds = await MutualFund.find({ 'investors.user': userId })
            .populate('investors.user', 'name')
            .populate('betHistory');

        // Combina ambos resultados en un solo arreglo y elimina duplicados
        const allFunds = [...currentFunds, ...userFunds].reduce((acc, fund) => {
            if (!acc.some(existingFund => existingFund._id.equals(fund._id))) {
                acc.push(fund);
            }
            return acc;
        }, []);

        if (allFunds.length === 0) {
            return res.status(404).json({ msg: 'No se encontraron fondos para el usuario' });
        }

        res.status(200).json({
            ok: true,
            mutualFunds: allFunds,
            msg: 'Fondos cargados'
        });

    } catch (error) {
        console.error('Error al obtener los fondos:', error.message);
        res.status(500).json({ msg: 'Ocurrió un error al obtener los fondos' });
    }
};

const getAllPeriodPercentages = async (req, res) => {
    try {
        // Obtener todos los registros de PeriodPercentage
        const periods = await PeriodPercentage.find();

        res.status(200).json({
            ok: true,
            periods,
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
    createUser,
    loginUser,
    getUserMutualFunds,
    getAllPeriodPercentages
    //validarCorreo,
    //RestablecerPassword,
};