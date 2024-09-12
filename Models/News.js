const { model, Schema } = require('mongoose')

const newsSchema = Schema({
   

    title: {
        type: String,
        require: true,

    },

    description: {
        type: String,
        require: true,
    },


    url_img: {
        type: String,
        default: "https://cdn-icons-png.flaticon.com/512/1046/1046874.png"
    },

    
   
});

module.exports = model('news', newsSchema);