/**
 * type definition example
 * The complete Triforce, or one or more components of the Triforce.
 * @typedef {Object} Triforce
 * @property {boolean} hasCourage - Indicates whether the Courage component is present.
 * @property {boolean} hasPower - Indicates whether the Power component is present.
 * @property {boolean} hasWisdom - Indicates whether the Wisdom component is present.
 */

const util = () => {

    /**
     * Map rooms with raw data from influxdb
     * @param influxdbMetadata
     * @param {Array<Place>} places
     * @return {*}
     */
    const mapPlacesWithRawData = (places, influxdbMetadata) => {
        const influxdbDataByNodes = influxdbMetadata.map(d => ({ [d.sensor_id]: Math.round(d._value), nodeId: d.nodeId }));
        const groupedData = groupBy(influxdbDataByNodes, 'nodeId');
        const mappedValues = places.map(place => {
            const sensorData = Object.assign({}, ...groupedData[place.nodeId]);
            return {
                ...place,
                ...sensorData,
                remainingTime: randomBetween(0, 120) < 50 ? 0 : randomBetween(0, 120),
                peopleCount: sensorData.peopleCount > place.seat ? 0 : sensorData.peopleCount, // rewrite peopleCount
            }
        });

        return transformMappedValues(mappedValues);
    }

    /**
     * create dictionnary with key as accessor
     * @param arr
     * @param key
     * @return {*}
     */
    const groupBy = (arr, key) => {
        return arr.reduce((acc, elem) => {
            (acc[elem[key]] = acc[elem[key]] || []).push(elem);
            delete elem[key];
            return acc;
        }, {});
    }


    /**
     * generate random number between two number
     * @param {number} min - included
     * @param {number} max - included
     * @return {number}
     */
    const randomBetween = (min, max) => {
        return Math.round(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Calculate humidex, noise level, brightness,...
     * @param {Array<*>} mappedValues
     * @return {Array<*>} - computed places
     */
    const transformMappedValues = mappedValues => {
        for (let i = 0; i < mappedValues.length; i++) {
            const place = mappedValues[i];

            for (const property in place) {
                // transform temperature
                if (property === 'temperature') {
                    const humidex = calculateHumidex(place.temperature, place.humidity);

                    if (humidex < 15) {
                        place.tempFeeling = 1;
                    } else if (humidex > 15 && humidex < 29) {
                        place.tempFeeling = 2;
                    } else {
                        place.tempFeeling = 3;
                    }
                    // transform noise
                } else if (property === 'noise') {
                    if (place[property] > 0 && place[property] < 30) {
                        place.noise = 1;
                    } else if (place[property] > 30 && place[property] < 50) {
                        place.noise = 2;
                    } else {
                        place.noise = 3;
                    }
                    // transform brightness
                } else if (property === 'brightness') {
                    if (place[property] > 0 && place[property] < 50) {
                        place.brightness = 1;
                    } else if (place[property] > 50 && place[property] < 200) {
                        place.brightness = 2;
                    } else if (place[property] > 200 && place[property] < 1000) {
                        place.brightness = 3;
                    } else {
                        place.brightness = 4;
                    }
                }
            }
            delete place.temperature;
            delete place.humidity;
            delete place.nodeId;
        }

        return mappedValues;
    };

    /**
     * calculate humidex
     * @param {number} temperature -
     * @param {number} humidity
     * @returns {number} humidex
     */
    const calculateHumidex = (temperature, humidity) => {
        const t = (7.5 * temperature) / (237.7 + temperature);
        const et = Math.pow(10, t);
        const e = 6.112 * et * (humidity / 100);
        return temperature + (5 / 9) * (e - 10);
    }

    return {
        mapPlacesWithRawData
    }

}

module.exports = util