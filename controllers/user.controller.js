const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/user.model');
const influxDbService = require('../services/influxdb.service')();
const PlaceUtil = require('../utils/place.util')();
const University = require('../models/university.model');

const userSchema = Joi.object({
    lastName: Joi.string(),
    firstName: Joi.string(),
    email: Joi.string().email(),
    password: Joi.string(),
    universityId: Joi.string(),
    campusId: Joi.string(),
})

const insertUser = async (user, res) => {
    // match email extension
    const emailExtension = user.email.replace(/^.+(@)/, '');
    const university = await University.findOne({ emailExtensions: emailExtension }).lean();
    user.universityId = university._id.toString();
    user.campusId = university.campuses[0].toString() || '';

    const result = await Joi.validate(user, userSchema, { abortEarly: false })
        .then(async (user) => {
            var user = addId('user', user, 'userId').then(async function (user) {
                user.hashedPassword = bcrypt.hashSync(user.password, 10);
                delete user.password;
                return await new User(user).save()
            }).catch((err) => ({ err: err.message }))
            return await user
        })
        .catch((err) => err.message);
    return result;
}

/**
 * add or remove place from favorites
 * @param req
 * @param res
 * @param next
 */
const manageHist = async (req, res, next) => {
    const { action, placeId } = req.body; // move userId in req.user with middleware ?
    const userId = req.user._id;
    if (userId && action && placeId) {
        try {
            const method = {
                add: '$addToSet',
                remove: '$pull',
            };
            if (!method[action]) throw new Error('Action not found');
            await User.updateOne({ _id: userId }, { [method[action]]: { visitedPlaces: placeId } });
            res.sendStatus(200);
        } catch (e) {
            res
                .status(404)
                .json({
                    status: 404,
                    error: 'Not Found. Requested resource could not be found',
                });
        }
    } else {
        res.status(400).json({ status: 400, error: 'Bad Request' });
    }
};


/**
 * find history by user id
 * @param req
 * @param res
 * @param next
 */
const findHistoryByUser = async (req, res, next) => {
    const userId = req.user._id;
    if (userId) {
        try {
            const user = await User.findById(userId).populate('visitedPlaces').lean();
            const places = user.visitedPlaces;
            res.send(places);
        } catch (e) {
            res.status(404);
        }
    } else {
        res.status(400);
    }
}

/**
 * add or remove place from favorites
 * @param req
 * @param res
 * @param next
 */
const manageFav = async (req, res, next) => {
    const { action, placeId } = req.body; // move userId in req.user with middleware ?
    const userId = req.user._id;
    if (userId && action && placeId) {
        try {
            const method = {
                add: '$addToSet',
                remove: '$pull'
            };
            if (!method[action]) throw new Error('Action not found');
            await User.updateOne({ _id: userId }, { [method[action]]: { favoritePlaces: placeId } });
            res.sendStatus(200);
        } catch (e) {
            res
                .status(404)
                .json({
                    status: 404,
                    error: 'Not Found. Requested resource could not be found',
                });
        }
    } else {
        res.status(400).json({ status: 400, error: 'Bad Request' });
    }
};

async function updateUserPassword(userId, password) {
    filter = { "userId": userId };
    let user = {};
    user.hashedPassword = bcrypt.hashSync(password, 10);
    delete user.password;
    return await User.findOneAndUpdate(filter, user, { new: true })
}


module.exports = {
    updateUserPassword,
    insertUser,
    manageHist,
    manageFav,
    findHistoryByUser
}
