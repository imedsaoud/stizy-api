const { InfluxDB } = require('@influxdata/influxdb-client')

// You can generate a Token from the "Tokens Tab" in the UI
const token = '-fdhxyQQZ2Nkx_8kON7OQ0bn-BkEe8csqKgPhPMpXAidJR0y85xre-HA3Cn5NIIggzotgRvFjP0o_YpcOOWs5w=='
const org = 'yahia.lamri@hetic.net'
const bucket = 'stizy'
const username = 'my-user'
/**InfluxDB password  */
const password = 'my-password'

const client = new InfluxDB({ url: 'https://europe-west1-1.gcp.cloud2.influxdata.com', token: token })

module.exports = client, org, bucket, token, username, password;