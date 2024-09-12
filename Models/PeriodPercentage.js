const { model, Schema } = require('mongoose');

const periodPercentageSchema = new Schema({
    endPeriod: {
        type: Date,
        required: true, // Asegura que la fecha de fin del período sea obligatoria
    },
    percentage: {
        type: Number,
        required: true, // Asegura que el porcentaje sea obligatorio
    }
});

module.exports = model('PeriodPercentage', periodPercentageSchema);