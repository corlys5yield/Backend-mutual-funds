const Transactions = require('../Models/Transactions');
const MutualFund = require('../Models/MutualFund');


// Asegúrate de que la ruta sea correcta

// Crear una nueva transacción
// Crear una nueva transacción
const createTransaction2 = async (req, res) => {
    const { user, type, amount, aliasBn, id_order, mutualFundId } = req.body;

    try {
        // Obtener el fondo común
        const mutualFund = await MutualFund.findById(mutualFundId);

        if (type === 'deposit') {

            // Verificar si ya existe una transacción con el mismo id_order
            let trans = await Transactions.findOne({ id_order });

            if (trans) {
                return res.status(400).json({
                    ok: false,
                    msg: "Ya existe un deposito con ese N° de orden"
                });
            }

            // Verificar si el usuario ya tiene un depósito en el fondo común
            const existingDeposit = await Transactions.findOne({
                user: user,
                mutualFundId: mutualFundId,
                type: 'deposit'  // Busca específicamente depósitos
            });

            if (existingDeposit && type === 'deposit') {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya has realizado una solicitud de depósito en este fondo común. Solo se permite una participacion por usuario.'
                });
            }

            // Verificar si el monto es menor que el monto mínimo requerido (solo para depósitos)
            if (type === 'deposit' && amount < mutualFund.minInvestmentAmount) {
                return res.status(400).json({
                    ok: false,
                    msg: `El monto del depósito debe ser al menos ${mutualFund.minInvestmentAmount}.`
                });
            }




        } else {

            // Verificar si el usuario ya ha realizado un retiro en el fondo común
            const existingWithdrawal = await Transactions.findOne({
                user: user,
                mutualFundId: mutualFundId,
                type: 'withdrawal'  // Busca específicamente retiros
            });

            if (existingWithdrawal && type === 'withdrawal') {
                return res.status(400).json({
                    ok: false,
                    msg: 'Ya has realizado una solicitud de retiro en este fondo común. Solo se permite un retiro por usuario en este fondo comun.'
                });
            }

            // Verificar si es un retiro y aplicar la lógica correspondiente
            if (type === 'withdrawal') {
                const investor = mutualFund.investors.find(i => i.user.toString() === user.toString());

                if (!investor) {
                    return res.status(400).json({
                        ok: false,
                        msg: 'Inversor no encontrado en este fondo común.' });
                }

                const currentDate = new Date();
                const endDate = new Date(mutualFund.endDate);

                console.log(`Fecha actual: ${currentDate}`);
                console.log(`Fecha de finalización del fondo: ${endDate}`);
                console.log(`Monto solicitado: ${amount}`);
                console.log(`Monto inicial del inversor: ${investor.initialAmount}`);
                console.log(`Rendimiento del inversor: ${investor.yield}`);

                // Si la solicitud de retiro se realiza antes de la fecha de fin
                if (currentDate < endDate) {
                    if (amount > investor.mount) {
                        return res.status(400).json({
                            ok: false,
                            msg: `Solo puedes retirar hasta $ ${investor.mount} que fue su monto inicial, antes de la fecha de fin del fondo.`
                        });
                    }
                } else {
                    // Después de la fecha de fin, el retiro se realiza del rendimiento
                    if (amount > investor.yield) {
                        return res.status(400).json({
                            ok: false,
                            msg: 'El monto excede el rendimiento disponible.'
                        });
                    }
                }
            }



        }


        // Crear una nueva instancia de la transacción
        trans = new Transactions({
            user,
            type,
            amount,
            aliasBn,
            id_order,
            mutualFundId
        });

   

        // Guardar la transacción en la base de datos
        const savedTransaction = await trans.save();

        // Responder con la transacción guardada
        res.status(201).json({
            ok: true,
            trans: savedTransaction,
            msg: 'Se ha creado una transacción correctamente, ahora debe esperar a que nuestros operadores la confirmen!'
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: "Por favor contactarse con el administrador"
        });
    }
};


// Obtener todas las transacciones
const getTransactions = async (req, res) => {
    try {
        const transactions = await Transactions.find().populate('user', 'email userName');
        res.status(200).json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener una transacción por ID
const getTransactionById = async (req, res) => {
    const { id } = req.params;

    try {
        const transaction = await Transactions.findById(id).populate('user', 'email userName');
        if (!transaction) {
            return res.status(404).json({ message: 'Transaction not found' });
        }
        res.status(200).json(transaction);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//confirmar transaccion
const confirmTransaction = async (req, res) => {

    try {
        const trans = await Transactions.findById(req.body._id); //recibe el id

        if (!trans) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ninguna transaccion con este Id',
            });
        }

        trans.status = 'approved';//aprovada

        await trans.save();

        res.status(200).json({
            ok: true,
            msg: 'se ah aprovadi su transaccion',
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'hable con el administrador',
        });
    }
};

//denegar transaccion
const rejectTransaction = async (req, res) => {

    try {
        const trans = await Transactions.findById(req.body._id); //recibe el id

        if (!trans) {
            return res.status(404).json({
                ok: false,
                msg: 'No existe ninguna transaccion con este Id',
            });
        }

        trans.status = 'rejected';//rechasada

        await trans.save();

        res.status(200).json({
            ok: true,
            msg: 'se ah rechasado su transaccion',
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({
            ok: false,
            msg: 'hable con el administrador',
        });
    }
};

//toma todas las transacciones de un usuario
const getTransactionsByUser = async (req, res) => {
    const userId = req.params.id; // Cambia 'userId' a 'id'

    try {
        // Filtrar las transacciones por el ID del usuario
        const transactions = await Transactions.find({ user: userId }).populate('user', 'email userName');
        res.status(200).json({ transactions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//toma todas las transacciones de un Fondo comun
const getTransactionsByFund = async (req, res) => {
    const fundId = req.params.fundId;

    try {
        // Filtrar las transacciones por el ID del fondo común
        const transactions = await Transactions.find({ fundId }).populate('user', 'email userName');
        res.status(200).json({ transactions }); // Enviamos un objeto con la clave `transactions`
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Eliminar una transacción
const deleteTransaction = async (req, res) => {
    const { id } = req.params;

    try {
        const transaction = await Transactions.findByIdAndDelete(id);

        if (!transaction) {
            return res.status(404).json({ message: 'Transaccion no encontrada' });
        }

        res.status(200).json({ message: 'Transaccion eliminada' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = {
    getTransactions,
    getTransactionById,
    confirmTransaction,
    rejectTransaction,
    getTransactionsByUser,
    deleteTransaction,
    createTransaction2,
    getTransactionsByFund
};