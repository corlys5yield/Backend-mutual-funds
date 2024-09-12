const { model, Schema } = require('mongoose')

const userSchema = Schema({//aquia claramos los datos que se van a tomar
   
    email: {
        type: String,
        require: true,
        unique: true,
    },

    userName: {
        type: String,
        require: true
    },

    lastName: {
        type: String,
        require: true
    },
   
    rol: {
        type: String,
        default:"user"
      },
    status: {
        type: String,
        default: "active" // esto determina si el usuario esta activo o no
    },
    password: {
        type: String,
        require: true
        
    }

});

module.exports = model('User', userSchema);