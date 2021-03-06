const mongoose = require('mongoose');

const CampusSchema = new mongoose.Schema({
    name: String,
    address: String,
    places: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place'
    }]
}, { collection: 'Campus', versionKey: false, timestamps: true });


module.exports = mongoose.model('Campus', CampusSchema);