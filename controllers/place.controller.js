const Place = require('../models/place.model'),
    PlaceUtil = require('../utils/place.util')(),
    Campus = require('../models/campus.model'),
    influxDbService = require('../services/influxdb.service')();


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
                /** @type {Campus} */
                const campusWithPlaces = await Campus.findById(id).populate('places').lean();
                const places = campusWithPlaces.places;

                const nodeIds = places.map(p => p.nodeId);
                const influxMetadata = await influxDbService.getLastSensorValuesByNodeIds(nodeIds);

                const mappedPlaces = PlaceUtil.mapPlacesWithRawData(places, influxMetadata);
                res.send(mappedPlaces);
            } catch (e) {
                res.status(404).json({ status: 404, error: "Not Found. Requested resource could not be found" });
            }
        } else {
            res.status(400).json({ status: 400, error: "Bad Request" });
        }
    }

    return {
        findByCampusId
    }
}


module.exports = controller;
