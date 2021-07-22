const { InfluxDB } = require('@influxdata/influxdb-client'),
    { token, url, org } = require('../config/influx-db')

const service = () => {
    const client = new InfluxDB({ url, token });

    /**
     * @param {NumberConstructor[]} nodeIds
     * @return {Promise<Array<*>>}
     */
    const getLastSensorValuesByNodeIds = nodeIds => {
        const queryApi = client.getQueryApi(org);
        const mappedNodeIdQuery = nodeIds.map(id => `r["nodeId"] == "${id}"`).join(' or ');

        const fluxQuery = `
            from(bucket: "stizy") 
                |> range(start: -1h) 
                |> filter(fn: (r) => r["_measurement"] == "stizyData")
                |> filter(fn: (r) => r["_field"] == "data_value")
                |> filter(fn: (r) => ${mappedNodeIdQuery})
                |> yield(name: "median")
        `;

        return queryApi.collectRows(fluxQuery);
    }


    return {
        getLastSensorValuesByNodeIds,
    }
}

module.exports = service;