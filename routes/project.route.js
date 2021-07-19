const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const projectCtrl = require('../controllers/project.controller');


const router = express.Router();
module.exports = router;

// router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
.get(function(req, res, next) {
	var project = projectCtrl.getProjects()	

	project.then((data)=>{
    	if (data) {
    		res.json(data);
    	} else {
				var error = " Not Found; Requested resource could not be found"
				var status = 404
				res.status(status).json({ status:status, error: error.toString() });	    		
    	}
  	})
  	// .catch((err)=>{
  	// 	console.log(err)
		// 	var error = "Bad Request; Request cannot be fulfilled due to bad syntax"
		// 	var status = 400		
		// 	res.status(status).json({ status:status, error: error.toString() });	    		
  	// })
})


