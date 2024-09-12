const { model, Schema } = require('mongoose')

const mutualfundSchema = Schema({//fondo comun de invercion

    name: {
        type: String,
        required: true
      },
      startDate: {//fecha inicio
        type: Date,
        required: true
      },
      endDate: {//fecha fin
        type: Date,
        required: true
      },
      maxInvestors: {//numero maximo de inversores
        type: Number,
        required: true
      },
      minInvestmentAmount: {//monto minimo para comenzar
        type: Number,
        required: true
      },
      totalInvestmentAmount: {//monto total par ainvertit
        type: Number,
        default: 0
      },
      totalEarnings: {//ganancias total generadas
        type: Number,
        default: 0
      },
      returnPercentage: {//porcentaje de retorno
        type: Number,
        default: 0
      },

      status: {//estado si esta vigente o si ya a h finalizado este fondo comun debe ser luego de la fecha de fin 
        type: String,
        enum: ['current', 'finalized'],
        default:'current'
      },

      betHistory: {//historial de apuestas
        type: [
            {
                date: {//fecha
                    type: Date,
                    default: Date.now
                  },
                  description: {//descripcion
                    type: String,
                    default: 'sin decripcion'
                  },
                  amount: {//monto apostado
                    type: Number,
                    required: true
                  },
                  outcome: {//resultado 
                    type: String,
                    default: '?'
                  },
                  earnings: {//generado o ganancias
                    type: Number,
                    required: true
                  }
                
            },
        ],
        
      },

      investors: {
        type:[
            {
                user: {//el usuario
                    type: Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                  },
                  mount: {//monto con el que entra al fondo comun
                      type: Number,
                      required: true
                  },

                  yield: {//monto generado
                    type: Number,
                    default:0 
                }

        }
           
      ]

      }, 
      

});

module.exports = model('MutualFund', mutualfundSchema);