const express = require('express');
const placeController = require('../controllers/place.controller')();

const router = express.Router();

router.route('/:id').get(placeController.findByCampusId)

module.exports = router;