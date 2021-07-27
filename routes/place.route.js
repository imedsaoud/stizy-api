const express = require('express');
const placeController = require('../controllers/place.controller')();
const passport = require('passport');
const router = express.Router();

router.use(passport.authenticate('jwt', { session: false }));

router.route('/').get(placeController.findByCampusId); // sur la page de recherche avec toutes les salles
router.route('/favorite').get(placeController.findFavsByUserId); // sur la page d'accueil avec les favoris et les nombres


module.exports = router;