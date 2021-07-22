const express = require('express');
const placeController = require('../controllers/place.controller')();

const router = express.Router();


router.route('/:campusId/:userId').get(placeController.findFavsByUserId); // sur la page d'accueil avec les favoris et les nombres

router.route('/:campusId').get(placeController.findByCampusId); // sur la page de recherche avec toutes les salle

router.route('/favorite/:id').post(placeController.manageFav); // ajouter supprimer des fav

module.exports = router;