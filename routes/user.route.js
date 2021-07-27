const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const userCtrl = require('../controllers/user.controller');

const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.route('/favorite').post(userCtrl.manageFav); // ajouter ou supprimer une salle des favs
router.route('/history').get(userCtrl.findHistoryByUser); // retrouver l'historique d'un user
router.route('/history').post(userCtrl.manageHist); // ajouter ou supprimer une salle de l'historique

module.exports = router;
