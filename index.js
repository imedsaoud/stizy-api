// config should be imported before importing any other file
const config = require('./config/config');
const app = require('./config/express');
require('./config/mongoose');
const httpServer = require('./config/express');
const httpsServer = require('./config/express');

// module.parent check is required to support mocha watch
// src: https://github.com/mochajs/mocha/issues/1912
if (!module.parent && config.https) {
    //httpServer.listen(80, () => {
    //	console.log('HTTP Server running on port 80');
    //});
    httpsServer.listen(config.port, () => {
        console.log('HTTPS Server running on port 443');
    });
} else {
    app.listen(config.port, () => {
        console.info(`server started on port ${config.port} (${config.env})`);
    });

}

module.exports = app;
