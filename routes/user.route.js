const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const userCtrl = require('../controllers/user.controller');

const router = express.Router();
module.exports = router;

router.use(passport.authenticate('jwt', { session: false }));

router.route('/favorite').post(userCtrl.manageFav); // ajouter ou supprimer une salle des favs
router.route('/history').get(userCtrl.findHistoryByUser); // retrouver l'historique d'un user
router.route('/history').post(userCtrl.manageHist); // ajouter ou supprimer une salle de l'historique


router.route('/')
.post(function(req, res, next) {

	if (req.query.password && req.query.userId) {
		user = userCtrl.updateUserPassword(req.query.userId,req.query.password)
	} else if (req.params.userId && req.query.action) {
		var user = userCtrl.manageHist(req.query.userId,)
	} else {
		var error = "Bad Request; Request cannot be fulfilled due to bad syntax"
		var status = 400
		res.status(status).json({ status:status, error: error.toString() });
	}

})


