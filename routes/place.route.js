const express = require('express');
const placeController = require('../controllers/place.controller')();

const router = express.Router();

router.route('/:campusId').get(placeController.findByCampusId)

module.exports = router;