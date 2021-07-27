const express = require('express');
const userRoutes = require('./user.route');
const authRoutes = require('./auth.route');
const placeRoutes = require('./place.route');
const { verifyToken } = require('../middleware/index');

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) => res.send('OK'));

router.use('/auth', authRoutes);
router.use('/user',  verifyToken, userRoutes);
router.use('/place', verifyToken, placeRoutes);

module.exports = router;
