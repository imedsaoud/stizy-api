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
  const fluxQuery = 'from(bucket: "stizy")|> range(start: -1h) |> filter(fn: (r) => r["_measurement"] == "mqtt_consumer")|> filter(fn: (r) => r["_field"] == "data_value")|> filter(fn: (r) => r["sensor_id"] == "112" or r["sensor_id"] == "114" or r["sensor_id"] == "122" or r["sensor_id"] == "107" or r["sensor_id"] == "121")'
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
