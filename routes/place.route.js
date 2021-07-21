const express = require('express');
const placeController = require('../controllers/place.controller')();

const router = express.Router();

router.route('/:campusId').get(placeController.findByCampusId);

router.route('/favorite/:id').patch(placeController.manageFav);

module.exports = router;