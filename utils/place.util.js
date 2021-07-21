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
     * @return {{[p: string]: *}[]}
     */
    const mapPlacesWithRawData = (places, influxdbMetadata) => {
        const influxdbDataByNodes = influxdbMetadata
            .map((d) => ({ [d.sensor_id]: d._value, nodeId: d.nodeId }))
            .reduce((acc, d) => {
                if (!acc[d.nodeId]) acc[d.nodeId] = [];
                acc[d.nodeId].push(d);
                delete d.nodeId;
                return acc;
            }, {});

        return places.map(place => {
            return {
                ...place,
                ...Object.assign({}, ...influxdbDataByNodes[place.nodeId])
            }
        });
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