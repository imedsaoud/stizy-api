const express = require('express');
const asyncHandler = require('express-async-handler')
const passport = require('passport');
const userCtrl = require('../controllers/user.controller');
const authCtrl = require('../controllers/auth.controller');
const config = require('../config/config');

const router = express.Router();

router.post('/register', asyncHandler(register), login);
router.post('/login', passport.authenticate('local', { session: false }), login);
router.get('/me', passport.authenticate('jwt', { session: false }), login);

module.exports = router;

async function register(req, res, next) {
    const user = await userCtrl.insertUser(req.body, res);
    if (user['err']) res.json(user.err);
    delete user.hashedPassword;
    req.user = user;
    next()
}

function login(req, res) {
    let user = req.user;
    let token = authCtrl.generateToken(user);
    res.json({ user, token });
}

