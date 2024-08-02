const { model, Schema } = require('mongoose')

const mutualfundSchema = Schema({//fondo comun de invercion

    userName: {
        type: String,
        require: true
    },
    

});

module.exports = model('MutualFund', userSchema);