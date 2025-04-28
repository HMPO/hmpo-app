const deepCloneMerge = require('deep-clone-merge');

const middleware = ({
    businessFlags
} = {}) => (req, res, next) =>{
    req.businessFlags = deepCloneMerge.extend(
        req.businessFlags || {},
        businessFlags,
        req.session && req.session.businessFlags
    );
    res.locals.businessFlags = req.businessFlags;
    next();
};


const getFlags = (req) => req.businessFlags || {};

const isEnabled = (flag, req) => getFlags(req)[flag] === true;

const isDisabled = (flag, req) => !isEnabled(flag, req);

const redirectIfEnabled = (flag, url) => (req, res, next) => {
    if (isEnabled(flag, req)) {
        return res.redirect(url);
    }
    next();
};

const redirectIfDisabled = (flag, url) => (req, res, next) => {
    if (isDisabled(flag, req)) {
        return res.redirect(url);
    }
    next();
};

const routeIf = (flag, handlerIf, handlerElse) => (req, res, next) => {
    if (isEnabled(flag, req)) {
        handlerIf(req, res, next);
    } else {
        handlerElse(req, res, next);
    }
};

module.exports = {
    middleware,
    getFlags,
    isEnabled,
    isDisabled,
    redirectIfEnabled,
    redirectIfDisabled,
    routeIf
};
