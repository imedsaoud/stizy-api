const Place = require('../models/place.model'),
  PlaceUtil = require('../utils/place.util')(),
  User = require('../models/user.model'),
  Campus = require('../models/campus.model'),
  influxDbService = require('../services/influxdb.service')();

const controller = () => {
  /**
   * On home page
   * @route {GET} /place/:campusId/:userId
   * @return {Promise<void>}
   */
  const findFavsByUserId = async (req, res, next) => {
    const { _id, campusId } = req.user;
    if (_id && campusId) {
      try {
        /** @type {Campus} */
        const campusWithPlaces = await Campus.findById(campusId).populate('places').lean();
        const places = campusWithPlaces.places;
        // fetch place datas form influx
        const nodeIds = places.map((p) => p.nodeId);
        const influxMetadata = await influxDbService.getLastSensorValuesByNodeIds(nodeIds);
        const mappedPlaces = PlaceUtil.mapPlacesWithRawData(places, influxMetadata);
        // compute favorites
        const userWithFavs = await User.findById(_id).lean();
        const userFavoritePlaces = userWithFavs.favoritePlaces.reduce((favPlaces, placeId) => {
            const favFind = mappedPlaces.find(p => p._id.toString() === placeId.toString());
            if (favFind) return favPlaces.concat(favFind);
          }, []);

        const counts = {
          empty: mappedPlaces.filter((p) => p.peopleCount === 0).length,
          quiet: mappedPlaces.filter(p => p.noise === 1).length,
          availableMoreThanOneHour: mappedPlaces.filter(p => p.remainingTime > 60).length,
          withProjector: mappedPlaces.filter(p => p.equipments.includes('projector')).length,
        };
        res.send({ favoritePlaces: userFavoritePlaces, counts });
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
        res.send(mappedPlaces);
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

  return {
    findByCampusId,
    findFavsByUserId,
  };
};

module.exports = controller;
