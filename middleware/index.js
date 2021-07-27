const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const config = require("../config/config");

const verifyToken = (req, res, next) => {
  const bearer = req.headers.authorization;
  if (!bearer) {
    res.sendStatus(401);
  } else {
    const token = bearer.replace("Bearer", "").trim();
    jwt.verify(token, config.jwtSecret, (err, user) => {
      if (err) {
        next({ httpCode: 401 });
      } else {
        user._id = mongoose.Types.ObjectId(user._id);
        req.user = user;
        next();
      }
    })
  }
}

module.exports = {
  verifyToken
};