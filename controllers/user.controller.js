const bcrypt = require('bcrypt');
const Joi = require('joi');
const User = require('../models/user.model');
const addId = require('../middleware/addId'); // À mettre en place + test
const influxDbService = require('../services/influxdb.service')();
const PlaceUtil = require('../utils/place.util')();

const userSchema = Joi.object({
  lastName: Joi.string(),
  firstName: Joi.string(),
  email: Joi.string().email(),
  role: Joi.string(),
  password: Joi.string(),
})

async function insertUser(user, res) {
  var result = await Joi.validate(user, userSchema, { abortEarly: false })
    .then(async function (user) {
      var user = addId('user', user, 'userId').then(async function (user) {
        user.hashedPassword = bcrypt.hashSync(user.password, 10);
        delete user.password;
        return await new User(user).save()
      }).catch(
        (err) => {
          return { err: err.message }
        })
      return await user
    })
    .catch(
      (err) => {
        return err.message
      })
  return result;
}

async function getUsers(req, res) {
  return User.find({})
}

async function getUserById(userId) {
  return User.findOne({ "userId": userId }, { "loggedAt": 0 })
}

async function getUserByEmail(email) {
  return User.findOne({ "email": email }, { "loggedAt": 0 })
}

async function deleteUserById(userId) {
  return User.findOneAndDelete({ "userId": userId })
}

async function deleteUserByEmail(email) {
  return User.findOneAndDelete({ "email": email })
}

async function updateUserById(userId, req) {
  console.log('updateUser');
  filter = { "userId": userId };
  update = await Joi.validate(req.body, userSchema, { abortEarly: false }).catch(
    (err) => {
      console.log(err.message);
      res.status(400)
    }
  )
  return await User.findOneAndUpdate(filter, update, { new: true })
}

async function updateUserPassword(userId, password) {
  filter = { "userId": userId };
  let user = {};
  user.hashedPassword = bcrypt.hashSync(password, 10);
  delete user.password;
  return await User.findOneAndUpdate(filter, user, { new: true })
}


/**
 * add or remove place from favorites
 * @param req
 * @param res
 * @param next
 */
const manageHist = async (req, res, next) => {
  const { action, userId } = req.body;
  const { id } = req.params;
  if (userId && action && id) {
    try {
      const method = {
        add: '$addToSet',
        remove: '$pull',
      };
      if (!method[action]) throw new Error('Action not found');
      await User.updateOne({ _id: userId }, { [method[action]]: { visitedPlaces: id } });
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

const findHistoryByUser = async (req, res, next) => {
  const { userId } = req.params;
  if (userId) {
      try {
          const user = await User.findById(userId).populate('visitedPlaces').lean();
          const places = user.visitedPlaces;
          const nodeIds = places.map((p) => p.nodeId);
          const influxMetadata = await influxDbService.getLastSensorValuesByNodeIds(nodeIds);
          const mappedPlaces = PlaceUtil.mapPlacesWithRawData(places, influxMetadata);
          res.send(mappedPlaces);
      } catch (e) {
          res.status(404);
      }
  } else {
    res.status(400);
  }
}


module.exports = {
  insertUser,
  getUsers,
  getUserById,
  getUserByEmail,
  updateUserById,
  deleteUserById,
  deleteUserByEmail,
  updateUserPassword,
  manageHist,
  findHistoryByUser
}
