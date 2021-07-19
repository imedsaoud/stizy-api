const express = require('express');
const passport = require('passport');
const asyncHandler = require('express-async-handler');
const projectCtrl = require('../controllers/project.controller');


const router = express.Router();
module.exports = router;

// router.use(passport.authenticate('jwt', { session: false }))

router.route('/')
.post(function(req, res, next) {
	projectCtrl.insertProject(req.body,res);
})
.get(function(req, res, next) {

	if (!req.query.projectId && req.query.userId) {
		var project = projectCtrl.getProjects(req.query.userId)	
	}
	else if (req.query.projectId && req.query.userId){
		var project = projectCtrl.getProjectById(req.query.projectId,req.query.userId)
	} else {
		var error = "Bad Request; Request cannot be fulfilled due to bad syntax"
		var status = 400		
		res.status(status).json({ status:status, error: error.toString() });
	}
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
.put(function(req, res, next) {
	if (req.query.projectId) {
		var project = projectCtrl.updateProjectById(req.query.projectId,req);
		project.then((data)=>{
	    	if (data) {
	    		res.json(data);
	    	}
	    	else{
					var error = " Not Found; Requested resource could not be found"
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
	if (req.query.projectId) {
		var project = projectCtrl.deleteProjectById(req.query.projectId);
		project.then((data)=>{
	    	if (data) {
	    		res.json(data);
	    	}
	    	else{
				var error = " Not Found; Requested resource could not be found"
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
		var error = "Bad Request; Request cannot be fulfilled due to bad syntax"
		var status = 400		
		res.status(status).json({ status:status, error: error.toString() });	
	}	
})


async function insertProject(req, res) {
  let project = await projectCtrl.insertProject(req.body);
  res.json(project);
}

