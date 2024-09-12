const { model, Schema } = require('mongoose')

const transactionSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',//le decimo al objeto que es la referencia de user
      required: true
    },
    type: {
      type: String,
      enum: ['deposit', 'withdrawal'],//solo aceptar aun dato tipo depocito o retiro
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],//pendiente aprovado rechasado
      default: 'pending'//default pendiente
    },
    date: {
      type: Date,
      default: Date.now
    },
    aliasBn: {
        type: String,
        required: true
    },
    id_order: {
        type: String,
        required: true
    },
    mutualFundId: { // Nuevo campo para asociar con el fondo común
      type: Schema.Types.ObjectId,
      ref: 'MutualFund',
      required: true
    }

  });
  
  module.exports = model('Transaction', transactionSchema);
  