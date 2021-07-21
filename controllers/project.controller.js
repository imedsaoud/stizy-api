const Project = require('../models/project.model');
const User = require('../models/user.model');
const Joi = require('joi');
const addId = require('../middleware/addId');
const request = require('request');
const axios = require('axios');
const config = require('../config/config');
const client = require('../config/influx-db');




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

async function getProjects() {

  let org = 'yahia.lamri@hetic.net'
  const queryApi = client.getQueryApi(org)
  const fluxQuery = 'from(bucket: "stizy")|> range(start: -1h)|> filter(fn: (r) => r["Node_ID"] == "12345678")|> filter(fn: (r) => r["sensor_id"] == "Bruit" or r["sensor_id"] == "Humidite" or r["sensor_id"] == "Nombre de personne" or r["sensor_id"] == "Luminosite" or r["sensor_id"] == "Temperature")|> yield(name: "mean")'
  queryApi.queryRows(fluxQuery, {
    next(row, tableMeta) {
      const o = tableMeta.toObject(row)
      console.log(JSON.stringify(o, null, 2))
      console.log(
        `${o._time} ${o._measurement} in '${o.location}' (${o.example}): ${o._field}=${o._value}`
      )

    },
    error(error) {
      console.error(error)
      console.log('\nFinished ERROR')
    },
    complete() {
      console.log('\nFinished SUCCESS')
    },
  })

}


module.exports = {
  insertProject,
  getProjects,
  // getProjectById,
  // updateProjectById,
  // deleteProjectById,
};
