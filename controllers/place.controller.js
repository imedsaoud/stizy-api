const client = require('../config/influx-db'),
    Place = require('../models/place.model'),
    PlaceUtil = require('../utils/place.util')(),
    Campus = require('../models/campus.model');


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
                const campusWithPlaces = await Campus.findById(id).populate('places').lean();
                const places = campusWithPlaces.places;

                const nodeIds = places.map(p => p.nodeId);
                const influxMetadata = await getLastSensorValuesByNodeIds(nodeIds);

                const mappedPlaces = PlaceUtil.mapPlacesWithRawData(places, influxMetadata);
                res.send(mappedPlaces);
            } catch (e) {
                res.status(404).json({ status: 404, error: "Not Found. Requested resource could not be found" });
            }
        } else {
            res.status(400).json({ status: 400, error: "Bad Request" });
        }
    }


    /**
     * @param {NumberConstructor[]} nodeIds
     * @return {Promise<Array<*>>}
     */
    const getLastSensorValuesByNodeIds = async nodeIds => {
        const org = 'yahia.lamri@hetic.net'
        const queryApi = client.getQueryApi(org);
        const mappedNodeIdQuery = nodeIds.map(id => `r["nodeId"] == "${id}"`).join(' or ');

        const fluxQuery = `
            from(bucket: "stizy") 
                |> range(start: -2h) 
                |> filter(fn: (r) => r["_measurement"] == "stizyData")
                |> filter(fn: (r) => r["_field"] == "data_value")
                |> filter(fn: (r) => ${mappedNodeIdQuery})
                |> last()
        `;

        return queryApi.collectRows(fluxQuery);
    }

    return {
        findByCampusId
    }
}


module.exports = controller;
