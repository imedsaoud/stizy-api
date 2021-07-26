const mongoose = require('mongoose');


const PlaceSchema = new mongoose.Schema({
    name: String, // A104, ...
    building: String, // batiment H, ...
    type: String, // salle de cours, amphi, labo, ...
    floor: String, // 3eme étage, rdc, -1
    seats: Number, // 23
    equipments: [{
        type: String,
        enum: ['whiteboard', 'projector', 'computer', 'speaker']
    }],
    nodeId: Number, // le node pour recup les infos sur influx db
}, { collection: 'Place', versionKey: false, timestamps: true });


module.exports = mongoose.model('Place', PlaceSchema);