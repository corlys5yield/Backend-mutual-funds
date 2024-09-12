const bcryptjs = require ('bcrypt');
const jwt = require("jsonwebtoken");
const MutualFund = require('../Models/MutualFund');

 // Asegúrate de que la ruta sea correcta

 // Creamos el nuevo fondo comun
const createMutualFund = async (req, res) => {
    const { name, startDate, endDate, maxInvestors, minInvestmentAmount, status } = req.body;

    try {
        // Crear una nueva instancia del fondo común
        const mutualFund = new MutualFund({
            name,
            startDate,
            endDate,
            maxInvestors,
            minInvestmentAmount
        });

        // Guardar el fondo común en la base de datos
        await mutualFund.save();

        // Responder con el fondo común creado
        res.status(201).json({
            ok: true,
            mutualFund,
            msg: 'Fondo común creado exitosamente'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Por favor contactarse con el administrador"
        });
    }
};


// Añade un inversor al fondo
const addInvestorToMutualFund = async (req, res) => {
    const { mutualFundId } = req.params;
    const { user, mount } = req.body;

    try {
        // Buscar el fondo común por su ID
        const mutualFund = await MutualFund.findById(mutualFundId);

        if (!mutualFund) {
            return res.status(404).json({
                ok: false,
                msg: 'Fondo común no encontrado'
            });
        }

        // Verificar si el usuario ya existe en el fondo común
        const existingInvestor = await MutualFund.findOne({
            _id: mutualFundId,
            investors: { $elemMatch: { user: user } }
        });

        if (existingInvestor) {
            return res.status(400).json({
                ok: false,
                msg: 'El usuario ya es un inversor en este fondo común'
            });
        }

        // Agregar el inversor con el yield inicial igual al monto invertido
        mutualFund.investors.push({ user, mount, yield: mount });

        // Sumar el monto de la inversión al totalInvestmentAmount
        mutualFund.totalInvestmentAmount += mount;

        // Sumar el monto inicial a las ganancias totales (totalEarnings)
        mutualFund.totalEarnings += mount;

        // Guardar los cambios
        await mutualFund.save();

        res.status(200).json({
            ok: true,
            mutualFund,
            msg: 'Inversor agregado al fondo común con yield inicializado'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Por favor contactarse con el administrador"
        });
    }
};

// liquida retiro de un inversor
const retireInvestorFromMutualFund = async (req, res) => {
    const { mutualFundId } = req.params;
    const { user, amount } = req.body;

    try {
        // Buscar el fondo común por su ID
        const mutualFund = await MutualFund.findById(mutualFundId);

        if (!mutualFund) {
            return res.status(404).json({
                ok: false,
                msg: 'Fondo común no encontrado'
            });
        }

        
         // Buscar al inversor en el array de inversores
         const investor = mutualFund.investors.find(investor => investor.user.toString() === user._id);
       

         if (!investor) {
             return res.status(404).json({
                 ok: false,
                 msg: 'El inversor no fue encontrado en este fondo común'
             });
         }
 
         // Aquí puedes operar con el inversor encontrado
         console.log('Inversor encontrado:', investor);


        if (amount <= investor.mount){

            // Restar el monto y el rendimiento del total del fondo
        mutualFund.totalInvestmentAmount -= amount;
        mutualFund.totalEarnings -= amount;

        // Restar el monto y rendimiento del inversor
        investor.mount -= amount;
        investor.yield -= amount; 

        }
       

        // Guardar los cambios
        await mutualFund.save();

        res.status(200).json({
            ok: true,
            mutualFund,
            msg: 'Ah confirmado el retiro de fondos del inversor'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Por favor contactarse con el administrador"
        });
    }
};


//Añade apuesta al fondo
const addBetResultToMutualFund = async (req, res) => {
    const { mutualFundId } = req.params;
    const { amount, earnings } = req.body;

    try {
        // Buscar el fondo común por su ID
        const mutualFund = await MutualFund.findById(mutualFundId);

        if (!mutualFund) {
            return res.status(404).json({
                ok: false,
                msg: 'Fondo común no encontrado'
            });
        }

        // Convertir amount y earnings a números por si acaso vienen como strings
        const amountNum = parseFloat(amount);
        const earningsNum = parseFloat(earnings);

        // Verificar que el monto apostado no sea mayor que las ganancias totales
        if (amountNum > mutualFund.totalEarnings) {
            return res.status(400).json({
                ok: false,
                msg: 'El monto apostado no puede ser mayor que las ganancias totales del fondo común'
            });
        }

        // Calcular la proporción de cada inversor y actualizar su yield
        mutualFund.investors.forEach(investor => {
            const proportion = investor.mount / mutualFund.totalInvestmentAmount;

            // Restar la parte correspondiente del monto apostado
            const investedLoss = proportion * amountNum;
            investor.yield -= investedLoss;

            // Sumar la parte correspondiente de las ganancias
            const investedGain = proportion * earningsNum;
            investor.yield += investedGain;
        });

        // Actualizar las ganancias totales del fondo
        mutualFund.totalEarnings -= amountNum;
        mutualFund.totalEarnings += earningsNum;

        // Registrar la apuesta en el historial
        mutualFund.betHistory.push({ amount: amountNum, earnings: earningsNum });

        // Calcular el porcentaje de ganancia
const totalInvestmentAmount = mutualFund.totalInvestmentAmount;
const totalEarnings = mutualFund.totalEarnings;

// Calcular las ganancias reales
const totalGains = totalEarnings - totalInvestmentAmount;

// Calcular el porcentaje de ganancia
const returnPercentage = totalInvestmentAmount > 0 ? (totalGains / totalInvestmentAmount) * 100 : 0;

// Actualizar el porcentaje de ganancia
mutualFund.returnPercentage = returnPercentage;
 
       


        // Guardar los cambios en la base de datos
        await mutualFund.save();

        res.status(200).json({
            ok: true,
            mutualFund,
            msg: 'Resultado de apuesta agregado y yields actualizados correctamente'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            ok: false,
            msg: "Por favor contactarse con el administrador"
        });
    }
};

// Finaliza el período del fondo común
const finalizeMutualFund2 = async (req, res) => {
    const { fundId } = req.params;

    try {
        // Buscar y actualizar el fondo común por ID, solo cambiando el status a "finalized"
        const updatedFund = await MutualFund.findByIdAndUpdate(
            fundId, 
            { status: 'finalized' }, // Actualización específica
            { new: true, runValidators: true } // Devuelve el documento actualizado y ejecuta validaciones
        );

        if (!updatedFund) {
            return res.status(404).json({ msg: 'Fondo común no encontrado' });
        }

        // Responder con el fondo común actualizado
        res.status(200).json({
            msg: 'Fondo común finalizado correctamente',
            fund: updatedFund
        });

    } catch (error) {
        console.error('Error al finalizar el fondo común:', error.message);
        res.status(500).json({ msg: 'Ocurrió un error al finalizar el fondo común' });
    }
};

//finalized fondo comun
const finalizeMutualFund = async (req, res) => {

    try {
        const mutualFund = await MutualFund.findById(req.body._id); //recibe el id

        if (!mutualFund) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ningun fondo comun con este Id',
            });
        }

        mutualFund.status = 'finalized';//finaliza el fondo comun

        await mutualFund.save();

        res.status(200).json({
            ok: true,
            msg: 'periodo finalizado',
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'hable con el administrador',
        });
    }
};

//fondo comun por id
const getMutualFundDetails = async (req, res) => {
    try {
        const { fundId } = req.params;

        // Buscar el fondo común por su ID y "populate" para obtener los inversores y el historial de apuestas
        const mutualFund = await MutualFund.findById(fundId)
            .populate('investors', 'user mount') // Obtener los inversores con sus campos relacionados
            .populate('betHistory') // Obtener el historial de apuestas

        if (!mutualFund) {
            return res.status(404).json({ msg: 'Fondo común no encontrado' });
        }

        // Responder con el fondo común y su información relacionada
        res.status(201).json({
            ok: true,
            mutualFund,
            msg: 'Fondo común cargado'
        });

        
        

    } catch (error) {
        console.error('Error al obtener los detalles del fondo común:', error.message);
        res.status(500).json({ msg: 'Ocurrió un error al obtener los detalles del fondo común' });
    }
};

//todos los fondos comunes
const getAllMutualFundsDetails = async (req, res) => {
    try {
        // Buscar todos los fondos comunes y "populate" para obtener los inversores y el historial de apuestas
        const mutualFunds = await MutualFund.find()
            .populate({
                path: 'investors.user', // Relaciona el campo 'user' en 'investors'
                model: 'User', // Especifica que es del modelo 'User'
                select: 'email userName lastName rol status' // Selecciona todos los campos que deseas obtener
            })
            .populate('betHistory'); // Obtener el historial de apuestas

        if (!mutualFunds || mutualFunds.length === 0) {
            return res.status(404).json({ msg: 'No se encontraron fondos comunes' });
        }

        // Responder con todos los fondos comunes y su información relacionada
        res.status(200).json({
            ok: true,
            mutualFunds,
            msg: 'fondos cargados'
        });

    } catch (error) {
        console.error('Error al obtener los detalles de los fondos comunes:', error.message);
        res.status(500).json({ msg: 'Ocurrió un error al obtener los detalles de los fondos comunes' });
    }
};

// Fondos comunes con status = 'current'
const getCurrentMutualFunds = async (req, res) => {
    try {
        // Buscar todos los fondos comunes con status 'current'
        const mutualFunds = await MutualFund.find({ status: 'current' })
            .populate({
                path: 'investors.user',
                model: 'User',
                select: 'email userName lastName rol status'
            })
            .populate('betHistory');

        if (!mutualFunds || mutualFunds.length === 0) {
            return res.status(404).json({ msg: 'No se encontraron fondos comunes en curso' });
        }

        // Responder con los fondos en curso
        res.status(200).json({
            ok: true,
            mutualFunds,
            msg: 'Fondos en curso cargados'
        });

    } catch (error) {
        console.error('Error al obtener los fondos en curso:', error.message);
        res.status(500).json({ msg: 'Ocurrió un error al obtener los fondos en curso' });
    }
};

// Fondos comunes con status = 'finalized'
const getFinalizedMutualFunds = async (req, res) => {
    try {
        // Buscar todos los fondos comunes con status 'finalized'
        const mutualFunds = await MutualFund.find({ status: 'finalized' })
            .populate({
                path: 'investors.user',
                model: 'User',
                select: 'email userName lastName rol status'
            })
            .populate('betHistory');

        if (!mutualFunds || mutualFunds.length === 0) {
            return res.status(404).json({ msg: 'No se encontraron fondos comunes finalizados' });
        }

        // Responder con los fondos finalizados
        res.status(200).json({
            ok: true,
            mutualFunds,
            msg: 'Fondos finalizados cargados'
        });

    } catch (error) {
        console.error('Error al obtener los fondos finalizados:', error.message);
        res.status(500).json({ msg: 'Ocurrió un error al obtener los fondos finalizados' });
    }
};


//modifica datos principales del fondo
const updateMutualFund = async (req, res) => {
    const { fundId } = req.params;
    const updates = req.body;

    try {
        // Buscar y actualizar el fondo común por ID
        const updatedFund = await MutualFund.findByIdAndUpdate(fundId, updates, {
            new: true, // Devuelve el documento actualizado
            runValidators: true // Ejecuta las validaciones definidas en el modelo
        });

        if (!updatedFund) {
            return res.status(404).json({ msg: 'Fondo común no encontrado' });
        }

        // Responder con el fondo común actualizado
        res.status(200).json({
            msg: 'Fondo común actualizado correctamente',
            fund: updatedFund
        });

    } catch (error) {
        console.error('Error al actualizar el fondo común:', error.message);
        res.status(500).json({ msg: 'Ocurrió un error al actualizar el fondo común' });
    }
};

//modifica dato de la apuesta del fondo
const updateBetInMutualFund = async (req, res) => {
    const { fundId, betId } = req.params;
    const { amount, outcome, earnings, description } = req.body;

    try {
        const mutualFund = await MutualFund.findById(fundId);

        if (!mutualFund) {
            return res.status(404).json({ msg: 'Fondo común no encontrado' });
        }

        const bet = mutualFund.betHistory.id(betId);

        if (!bet) {
            return res.status(404).json({ msg: 'Apuesta no encontrada' });
        }

        // Actualizar campos específicos de la apuesta
        if (amount !== undefined) bet.amount = amount;
        if (outcome !== undefined) bet.outcome = outcome;
        if (earnings !== undefined) bet.earnings = earnings;
        if (description !== undefined) bet.description = description;

        await mutualFund.save();

        res.status(200).json({ msg: 'Apuesta actualizada correctamente', bet });

    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar la apuesta', error: error.message });
    }
};


//modifica dato del inversor
const updateInvestorInMutualFund = async (req, res) => {
    const { fundId, investorId } = req.params;
    const { user, mount } = req.body;

    try {
        const mutualFund = await MutualFund.findById(fundId);

        if (!mutualFund) {
            return res.status(404).json({ msg: 'Fondo común no encontrado' });
        }

        const investor = mutualFund.investors.id(investorId);

        if (!investor) {
            return res.status(404).json({ msg: 'Inversor no encontrado' });
        }

        // Actualizar campos específicos del inversor
        if (user !== undefined) investor.user = user;
        if (mount !== undefined) investor.mount = mount;

        await mutualFund.save();

        res.status(200).json({ msg: 'Inversor actualizado correctamente', investor });

    } catch (error) {
        res.status(500).json({ msg: 'Error al actualizar el inversor', error: error.message });
    }
};


const deleteMutualFund = async (req, res) => {
    const { fundId } = req.params;

    try {
        // Buscar y eliminar el fondo común por su ID
        const deletedFund = await MutualFund.findByIdAndDelete(fundId);

        // Verificar si el fondo común existía
        if (!deletedFund) {
            return res.status(404).json({
                ok: false,
                msg: 'Fondo común no encontrado'
            });
        }

        // Responder con un mensaje de éxito
        res.status(200).json({
            ok: true,
            msg: 'Fondo común eliminado correctamente'
        });
    } catch (error) {
        console.error('Error al eliminar el fondo común:', error.message);
        res.status(500).json({
            ok: false,
            msg: 'Error al eliminar el fondo común, por favor contacta al administrador'
        });
    }
};



module.exports = {
    createMutualFund,
    addInvestorToMutualFund,
    addBetResultToMutualFund ,
    getCurrentMutualFunds,
    getFinalizedMutualFunds,
    getAllMutualFundsDetails,
    finalizeMutualFund,
    retireInvestorFromMutualFund

};