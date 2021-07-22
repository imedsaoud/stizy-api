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
        return places.map(place => {
            return {
                ...place,
                remainingTime: randomBetween(0, 120) < 50 ? 0 : randomBetween(0, 120),
                ...Object.assign({}, ...groupedData[place.nodeId])
            }
        });
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
     * @param {Array<Place>} places
     * @return {Array<Place>} - computed places
     */
    const computePlacesWithCalculatedData = (places) => {

    }

    return {
        mapPlacesWithRawData
    }

}

module.exports = util