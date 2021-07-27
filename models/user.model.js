const mongoose = require('mongoose');


const UserSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true
    },
    lastName: {
        type: String,
        required: true
    },
    firstName: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        // Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
        match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'Please enter a valid email'],
    },
    visitedPlaces: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
    }],
    favoritePlaces: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Place',
    }],
    hashedPassword: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        required: true,
    },
    role: {
        type: String,
        default: "user",
        required: true
    },
    campusId: {
        type: String,
        required: true
    },
    universityId: {
        type: String,
        required: true
    },
}, {
    collection: 'User',
    versionKey: false
});


module.exports = mongoose.model('User', UserSchema);



  