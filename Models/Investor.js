const { model, Schema } = require('mongoose')

const investorSchema = new Schema({
    user: {
      type: Schema.Types.ObjectId,//decimos que solo vamos a pasar el id en este caso el id del user que se vincula a esta cuenta inversor
      ref: 'User',
      required: true
    },
    mount: {
        type: Number,
        default: 0
    }
    
  });
  
  module.exports = model('Investor', investorSchema);