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
    const { userId, campusId } = req.params;
    if (userId && campusId) {
      try {
        /** @type {Campus} */
        const campusWithPlaces = await Campus.findById(campusId)
          .populate('places')
          .lean();
        const places = campusWithPlaces.places;
        // fetch place datas form influx
        const nodeIds = places.map((p) => p.nodeId);
        const influxMetadata =
          await influxDbService.getLastSensorValuesByNodeIds(nodeIds);
        const mappedPlaces = PlaceUtil.mapPlacesWithRawData(
          places,
          influxMetadata
        );
        // compute favorites
        const userWithFavs = await User.findById(userId).lean();
        const userFavoritePlaces = userWithFavs.favoritePlaces.reduce(
          (favPlaces, placeId) => {
            const favFind = mappedPlaces.find(
              (p) => p._id.toString() === placeId.toString()
            );
            if (favFind) return favPlaces.concat(favFind);
          },
          []
        );

        const counts = {
          empty: mappedPlaces.filter((p) => p.peopleCount === 0),
          quiet: 0, // todo
          availableMoreThanOneHour: mappedPlaces.filter(
            (p) => p.remainingTime > 60
          ),
          withProjector: mappedPlaces.filter((p) =>
            p.equipments.includes('projector')
          ).length,
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
    const { campusId } = req.params;
    if (campusId) {
      try {
        /** @type {Campus} */
        const campusWithPlaces = await Campus.findById(campusId)
          .populate('places')
          .lean();
        const places = campusWithPlaces.places;

        const nodeIds = places.map((p) => p.nodeId);
        const influxMetadata =
          await influxDbService.getLastSensorValuesByNodeIds(nodeIds);

        const mappedPlaces = PlaceUtil.mapPlacesWithRawData(
          places,
          influxMetadata
        );

        const transformedPlaces = transformMappedValues(mappedPlaces);
        res.send(transformedPlaces);
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
          remove: '$pull',
        };
        if (!method[action]) {
          throw new Error('Action not found');
        }
        await User.updateOne(
          { _id: userId },
          { [method[action]]: { favoritePlaces: id } }
        );
        res.sendStatus(200);
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

  transformMappedValues = (mappedValues) => {
    for (let i = 0; i < mappedValues.length; i++) {
      const place = mappedValues[i];

      for (const property in place) {
        // transform temperature 
        if (property === 'temperature') {
          const t = (7.5 * place[property]) / (237.7 + place[property]);
          const et = Math.pow(10, t);
          const e = 6.112 * et * (place['humidity'] / 100);
          const humidex = place[property] + (5 / 9) * (e - 10);

          if (humidex < 15) {
            place.tempFeeling = '1';
          } else if (humidex > 15 && humidex < 29) {
            place.tempFeeling = '2';
          } else {
            place.tempFeeling = '3';
          }
        // transform noise
        } else if (property === 'noise') {
          if (place[property] > 0 && place[property] < 30) {
            place.noise = '1';
          } else if (place[property] > 30 && place[property] < 50) {
            place.noise = '2';
          } else {
            place.noise = '3';
          }
        // transform brightness 
        } else if (property === 'brightness') {
          if (place[property] > 0 && place[property] < 50) {
            place.brightness = '1';
          } else if (place[property] > 50 && place[property] < 200) {
            place.brightness = '2';
          } else if (place[property] > 200 && place[property] < 1000) {
            place.brightness = '3';
          } else {
            place.brightness = '4';
          }
        } else {
        //   console.log('transformation not needed');
        }
      }
    }

    return mappedValues;
  };

  return {
    findByCampusId,
    findFavsByUserId,
    manageFav,
  };
};

module.exports = controller;
