const Place = require('../models/place.model'),
    PlaceUtil = require('../utils/place.util')(),
    User = require('../models/user.model'),
    Campus = require('../models/campus.model'),
    influxDbService = require('../services/influxdb.service')();

const controller = () => {
    /**
     * On home page
     */
    const findFavsByUserId = async (req, res, next) => {
        const { _id, campusId } = req.user;
        if (_id && campusId) {
            try {
                const userWithFavs = await User.findById(_id).lean();
                const userFavoritePlaces = userWithFavs.favoritePlaces
                res.send({ favoritePlaces: userFavoritePlaces });
            } catch (e) {
                console.log('e : ', e);
                res
                    .status(404)
                    .json({
                        status: 404,
                        error: 'Not Found. Requested resource could not be found',
                    });
            }
        } else {
            res.status(400).json({ status: 400, error: 'Bad Request' });
        }
    };

    /**
     * @route {GET} /place/:campusId
     * @returns {Promise<void>}
     */
    const findByCampusId = async (req, res, next) => {
        const { campusId } = req.user;
        if (campusId) {
            try {
                /** @type {Campus} */
                const campusWithPlaces = await Campus.findById(campusId).populate('places').lean();
                const places = campusWithPlaces.places;
                const nodeIds = places.map((p) => p.nodeId);
                const influxMetadata = await influxDbService.getLastSensorValuesByNodeIds(nodeIds);
                const mappedPlaces = PlaceUtil.mapPlacesWithRawData(places, influxMetadata);
                const counts = {
                    empty: countBy(mappedPlaces, p => p.peopleCount === 0),
                    quiet: countBy(mappedPlaces, p => p.noise === 1),
                    availableMoreThanOneHour: countBy(mappedPlaces, p => p.remainingTime > 60),
                    withProjector: countBy(mappedPlaces, p => p.equipments.includes('projector')),
                };
                res.send({ places: mappedPlaces, counts });
            } catch (e) {
                res
                    .status(404)
                    .json({
                        status: 404,
                        error: 'Not Found. Requested resource could not be found',
                    });
            }
        } else {
            res.status(400).json({ status: 400, error: 'Bad Request' });
        }
    };

    const countBy = (data, predicate) => data.filter(predicate).length;

    return {
        findByCampusId,
        findFavsByUserId,
    };
};

module.exports = controller;
