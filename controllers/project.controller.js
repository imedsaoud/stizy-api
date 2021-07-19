const Project = require('../models/project.model');
const User = require('../models/user.model');
const Joi = require('joi');
const addId = require('../middleware/addId');
const request = require('request');
const axios = require('axios');
const config = require('../config/config');

const projectSchema = Joi.object({
  ownerId: Joi.number().required(),
  title: Joi.string().required().required(),
  shortDescription: Joi.string().required(),
  longDescription: Joi.string().required(),
  useCaseId: Joi.number().required(),
  userIds: Joi.array(),
});

async function insertProject(project, res) {
  result = Joi.validate(project, projectSchema, { abortEarly: false })
    .then((project) => {
      addId('project', project, 'projectId')
        .then((project) => {
          new Project(project)
            .save()
            .then((result) => {
              res.status(200).json({
                status: true,
                message: 'project saved successfully',
                result: result,
              });
            })
            .catch((err) => {
              res.status(400).json({ err: err.message });
            });
        })
        .catch((err) => {
          res.status(400).json({ err: err.message });
        });
    })
    .catch((err) => {
      res.status(400).json({ err: err.message });
    });
}

// async function getProjects(userId) {
//   var hrstart = process.hrtime();
//   var fullProjects = [];
//   var projects = await Project.find(
//     { userIds: { $in: userId } },
//     {
//       _id: 0,
//       projectId: 1,
//       ownerId: 1,
//       title: 1,
//       shortDescription: 1,
//       useCaseId: 1,
//       userIds: 1,
//       status: 1,
//       createdAt: 1,
//       updatedAt: 1,
//     }
//   );

//   for (let i = 0; i < projects.length; i++) {
//     let project = projects[i];
//     project = project.toJSON();
//     // let metricCountQuery =
//     //   'http://0.0.0.0:4141/api/chart?chartDataQuery=SELECT count(*) FROM project_' +
//     //   project.projectId +
//     //   '_result_data';

//     let metricCountQuery = `${config.uri}:4141/api/chart?chartDataQuery=SELECT reltuples::bigint AS count ` + 
//     'FROM pg_class ' +
//     "WHERE relname='project_" +
//                     project.projectId +
//                     "_result_data"+"'";


//     project.usecase = await UseCase.findOne({ useCaseId: project.useCaseId },{
//       businessTag: 1
//     });
//     project.ownerInfo = await User.find(
//       { userId: { $in: project.ownerId } },
//       { _id: 0, avatar: 1, email: 1, firstName: 1, lastName: 1 }
//     );
//     project.usersInfo = await User.find(
//       { userId: { $in: project.userIds } },
//       { _id: 0, avatar: 1, email: 1, firstName: 1, lastName: 1 }
//     );

//     project.execs = await Exec.find({ projectId: { $in: project.projectId } }).then(
//       (data) => {
//         if (data.length > 0) {
//           project.status = data[0].status
//         } else {
//           project.status = 'Actif';
//         }
//       }
//     );

//     project.metricCount = await axios
//       .get(metricCountQuery)
//       .then(function (response) {
//         // handle success
//         return response.data.data[0][0].count 
//       })
//       .catch(function (error) {
//         // handle error
//         return 0
//       })
  

//     fullProjects.push(project);

//   }
//   hrend = process.hrtime(hrstart);
//   console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000);
//   return await fullProjects;
// }


// async function getProjectById(projectId, userId) {
//   let project = await Project.findOne(
//     { projectId: projectId, userIds: { $in: userId } },
//     {
//       _id: 0,
//       title: 1,
//       longDescription: 1,
//       shortDescription: 1,
//       createdAt: 1,
//       updatedAt: 1,
//       status: 1,
//       userIds: 1,
//       ownerId: 1,
//       projectId: 1,
//       useCaseId: 1,
//     }
//   );
//   console.log(project);
//   project = project.toJSON();
//   let ownerInfo = await User.find(
//     { userId: { $in: project.ownerId } },
//     { _id: 0, avatar: 1, email: 1, firstName: 1, lastName: 1 }
//   );

//   //FIXME userIds should be string in dbb to be retrieve
//   let query = { userId: {$in : project.userIds} }
//   let usersInfo = await User.find(
//     query,
//     { _id: 0, avatar: 1, email: 1, firstName: 1, lastName: 1 }
//   );

//   let usecase = await UseCase.findOne({ useCaseId: project.useCaseId });
  
//   // let metricCountQuery =
//   // 'http://0.0.0.0:4141/api/chart?chartDataQuery=SELECT count(*) FROM project_' +
//   // project.projectId +
//   // '_result_data';

//   let metricCountQuery = `${config.uri}:4141/api/chart?chartDataQuery=SELECT reltuples::bigint AS count ` + 
//   'FROM pg_class ' +
//   "WHERE relname='project_" +
//                   project.projectId +
//                   "_result_data"+"'";
                    

//   project.metricCount = await axios
//       .get(metricCountQuery)
//       .then(function (response) {
//         // handle success
//         return response.data.data[0][0].count 
//       })
//       .catch(function (error) {
//         // handle error
//         return 0
//       })
//   //let algorithm = await  Algorithm.find({"algoId":project.algoIds[0]})

//   // let execs = await Exec.find({ projectId: { $in: project.projectId } }).then(
//   //   (data) => {
//   //     if (data.length > 0) {
//   //       if (data[0].status === 'running' || 'queue') {
//   //         project.status = 'En cours';
//   //       } else if (data[0].status === 'failed') {
//   //         project.status = 'Erreur';
//   //       } else {
//   //         project.status = 'Actif';
//   //       }
//   //     } else {
//   //       project.status = 'Actif';
//   //     }
//   //   }
//   // );

//   project.usecase = usecase.toJSON();
//   project.ownerInfo = ownerInfo;
//   project.usersInfo = usersInfo;

//   console.log('CHECK OWNER INFO && USERS INFO', project);
//   return project;
// }

async function deleteProjectById(projectId) {
  return Project.findOneAndDelete({ projectId: projectId });
}

async function updateProjectById(projectId, req) {
  filter = { projectId: projectId };
  update = await Joi.validate(req.body, projectSchema, {
    abortEarly: false,
  }).catch((err) => {
    console.log(err.message);
    res.status(400);
  });
  return await Project.findOneAndUpdate(filter, update, { new: true });
}

module.exports = {
  insertProject,
  // getProjects,
  // getProjectById,
  updateProjectById,
  deleteProjectById,
};
