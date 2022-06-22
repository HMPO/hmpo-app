const frameguard = require('frameguard');
const nocache = require('./nocache');
const compatibility = require('./compatibility');
const compression = require('compression');

const setup = (app, { disableCompression = false, trustProxy = true, publicPath='/public'} = {}) => {
    app.disable('x-powered-by');
    app.set('trust proxy', trustProxy);
    app.use(frameguard('sameorigin'));
    app.use(nocache.middleware({ publicPath }));
    app.use(compatibility.middleware());
    if (!disableCompression) app.use(compression());
};

module.exports = {
    setup
};
