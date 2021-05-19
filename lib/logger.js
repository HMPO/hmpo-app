const hmpoLogger = require('hmpo-logger');
const config = require('./config');

const setup = (options = config.get('logs', {})) => hmpoLogger.config(options);

const get = name => hmpoLogger.get(name || ':hmpo-app');

module.exports = Object.assign(get, {
    setup,
    get
});
