const express = require('express');
const projectCtrl = require('../controllers/project.controller');


const router = express.Router();
module.exports = router;

router
    .route('/')
    .get((req, res, next) => {
        projectCtrl
            .getLastSensorValuesByNodeId(12345678) // example
            .then(data => {
                if (data) {
                    const mappedData = data.map((d) => ({ [d.sensor_id]: d._value, nodeId: d.nodeId }));
                    res.json(mappedData);
                } else {
                    const error = " Not Found; Requested resource could not be found"
                    const status = 404
                    res.status(status).json({ status: status, error: error.toString() });
                }
            });
    })


