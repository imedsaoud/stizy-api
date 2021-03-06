const mongoose = require('mongoose');

const UniversitySchema = new mongoose.Schema({
    name: String,
    emailExtentions: [String],
    address: String,
    campuses: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Campus'
    }],
}, { collection: 'University', versionKey: false, timestamps: true });


module.exports = mongoose.model('University', UniversitySchema);