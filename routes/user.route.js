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

	if (req.url === "/") {
		userCtrl.insertUser(req.body,res);
	}
	else if (req.query.password && req.query.userId) {
		user = userCtrl.updateUserPassword(req.query.userId,req.query.password)
	} else if (req.query.userId) {
		var user = userCtrl.getUserById(req.query.userId)
	} else if (req.params.userId && req.query.action) {
		var user = userCtrl.manageHist(req.query.userId,)
	} else {
		var error = "Bad Request; Request cannot be fulfilled due to bad syntax"
		var status = 400
		res.status(status).json({ status:status, error: error.toString() });
	}

})
.get(function(req, res, next) {

	if (req.url === "/") {
		var user = userCtrl.getUsers()
	}
	else if (req.query.email) {
		var user = userCtrl.getUserByEmail(req.query.email)
	} else if (req.query.userId) {
		var user = userCtrl.getUserById(req.query.userId)
	}
	else{
		var error = "Bad Request; Request cannot be fulfilled due to bad syntax"
		var status = 400
		res.status(status).json({ status:status, error: error.toString() });
	}
	user.then((data)=>{
    	if (data) {
    		var status = 200
    		res.status(status).json({status:status, result:data});
    	}
    	else{
			var error = "Not Found; Requested resource could not be found"
			var status = 404
			res.status(status).json({ status:status, error: error.toString() });
    	}
  	})
  	.catch((err)=>{
  		console.log(err)
		var error = "Bad Request; Request cannot be fulfilled due to bad syntax"
		var status = 400
		res.status(status).json({ status:status, error: error.toString() });
  	})
})
.put(function(req, res, next) {
	if (req.query.userId) {
		var user = userCtrl.updateUserById(req.query.userId, req);
		user.then((data)=>{
	    	if (data) {
	    		res.json(data);
	    	}
	    	else{
				var error = "Not Found; Requested resource could not be found"
				var status = 404
				res.status(status).json({ status:status, error: error.toString() });
	    	}
	  	})
	  	.catch((err)=>{
			var error = "Bad Request; Request cannot be fulfilled due to bad syntax"
			var status = 400
			res.status(status).json({ status:status, error: error.toString() });
	  	})
	}
	else{
		var error = "Parameter is missing"
		res.status(404).json({ error: error.toString() });
	}
})
.delete(function(req, res, next) {
	if (req.query.userId) {
		var user = userCtrl.deleteUserById(req.query.userId);
	} else if (req.query.email) {
		var user = userCtrl.deleteUserByEmail(req.query.email);
		user.then((data)=>{
	    	if (data) {
					var status = 200
					res.status(status).json({status:status, result:data});
	    	}
	    	else{
				var error = "Not Found; Requested resource could not be found"
				var status = 404
				res.status(status).json({ status:status, error: error.toString() });
	    	}
	  	})
	  	.catch((err)=>{
			var error = "Bad Request; Request cannot be fulfilled due to bad syntax"
			var status = 400
			res.status(status).json({ status:status, error: error.toString() });
	  	})
	}
	else{
		var error = "Parameter is missing"
		res.status(404).json({ error: error.toString() });
	}
})



async function insertUser(req, res) {
  let user = await userCtrl.insertUser(req.body);
  res.json(user);
}

