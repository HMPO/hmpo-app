const nocache = require('nocache')();

const middleware = ({
    publicPath
} = {}) => (req, res, next) => {
    if (req.path.indexOf(publicPath) >= 0) {
        return next();
    }

    // nocache removed the Pragma header in v4, so we add it back here
    // see: https://github.com/helmetjs/nocache/pull/26
    res.setHeader('Pragma', 'no-cache');
    return nocache(req, res, next);
};

module.exports = {
    middleware
};
