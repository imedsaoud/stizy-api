const client = require('../config/influx-db');

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


module.exports = {
    getLastSensorValuesByNodeId
};
