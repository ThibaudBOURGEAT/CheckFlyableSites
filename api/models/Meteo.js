const mongoose = require('mongoose');

const meteo_schema = new mongoose.Schema({
    coord: {
        lon: { type:Number, required: true},
        lat: { type:Number, required: true}
    },
    weather: {
        id: { type:Number, required: true},
        main: { type:String, required: true},
        description: { type:String, required: true}
    },
    wind: {
        speed: { type:Number, required: true},
        deg: { type:Number }
    },
    date: { type: Date, default: Date.now },
    flyable: {type: Boolean}
});

module.exports = mongoose.model('Meteo', meteo_schema);
