const Place = require('../models/place.model'),
    PlaceUtil = require('../utils/place.util')(),
    User = require('../models/user.model'),
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
        const { campusId } = req.params;
        if (campusId) {
            try {
                // todo : renvoyer soit les favoris soit toutes les salles
                /** @type {Campus} */
                const campusWithPlaces = await Campus.findById(campusId).populate('places').lean();
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
    };

    /**
     * add or remove place from favorites
     * @param req
     * @param res
     * @param next
     */
    const manageFav = async (req, res, next) => {
        const { action, userId } = req.body; // move userId in req.user with middleware ?
        const { id } = req.params;
        if (userId && action && id) {
            try {
                const method = {
                    add: '$addToSet',
                    remove: '$pull'
                };
                if (!method[action]) {
                    throw new Error('Action not found');
                }
                await User.updateOne({ _id: userId }, { [method[action]]: { favoritePlaces: id } });
                res.sendStatus(200);
            } catch (e) {
                res.status(404).json({ status: 404, error: "Not Found. Requested resource could not be found" });
            }
        } else {
            res.status(400).json({ status: 400, error: "Bad Request" });
        }
    };


    return {
        findByCampusId,
        manageFav
    };
}


module.exports = controller;
