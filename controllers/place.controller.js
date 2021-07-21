const client = require('../config/influx-db');
const Place = require('../models/place.model');
const Campus = require('../models/campus.model');


const controller = () => {


    /**
     * @param req
     * @param res
     * @param next
     * @returns {Promise<void>}
     */
    const findByCampusId = async (req, res, next) => {
        const { id } = req.params;
        if (id) {
            try {
                const campusWithPlaces = await Campus.findOne({ _id: '60f59165105fa7ad858b82ec' });
                console.log('campusWithPlaces : ', campusWithPlaces);
                // faire une boucle pour aller requeter chaque salle
                // const influxMetaData = await getLastSensorValuesByNodeId() // example
                // const mappedData = influxMetaData.map((d) => ({ [d.sensor_id]: d._value, nodeId: d.nodeId }));
                // res.json(mappedData);
            } catch (e) {
                console.log(e);
                const error = " Not Found; Requested resource could not be found"
                const status = 404
                res.status(status).json({ status: status, error: error.toString() });
            }
        } else {
            res.status(400).json({ status: 400, error: "Bad Request" });
        }
    }


    /**
     * @param {number} nodeId
     * @return {Promise<Array<*>>}
     */
    const getLastSensorValuesByNodeId = async nodeId => {
        const org = 'yahia.lamri@hetic.net'
        const queryApi = client.getQueryApi(org);

        const fluxQuery = `
            from(bucket: "stizy") 
                |> range(start: -2h) 
                |> filter(fn: (r) => r["_measurement"] == "stizyData")
                |> filter(fn: (r) => r["_field"] == "data_value")
                |> filter(fn: (r) => r["nodeId"] == "${nodeId}")
                |> last()
        `;

        return queryApi.collectRows(fluxQuery);
    }

    return {
        findByCampusId,
        getLastSensorValuesByNodeId
    }
}


module.exports = controller;
