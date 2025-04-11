const express = require('express');
const config = require('./lib/config');
const logger = require('./lib/logger');
const middleware = require('./middleware');
const redisClient = require('./lib/redis-client');

/**
 * Initializes and sets up the core components of hmpo-app.
 * This function configures logging, Redis, middleware, error handling, session management, and HTTP server settings.
 *
 * The setup process can be customized using the provided `options` object. The function will initialize the components based on the options provided, or default to values from the `config` module.
 *
 * @param {Object} [options={middlewareSetupFn: undefined}] - Configuration options to customize the setup process.
 * @param {Object} [options.config] - Optional configuration for the `config.setup()` method. Set to `false` to skip configuration setup.
 * @param {Object} [options.logs] - Optional configuration for logging. Merged with the default config fetched by `config.get('logs')`. Set to `false` to skip log setup.
 * @param {Object} [options.redis] - Optional configuration for the Redis client. Merged with the default config fetched by `config.get('redis')`. Set to `false` to skip Redis setup.
 * @param {Function} [options.middlewareSetupFn] - Optional function that can be used to further customize the middleware setup. This function receives the `app` instance.
 * @param {Object} [options.session] - Optional configuration for session management. Merged with the default config fetched by `config.get('session')`. Set to `false` to skip session setup.
 * @param {Object} [options.errors] - Optional configuration for error handling. Merged with the default config fetched by `config.get('errors')`. Set to `false` to skip error handler setup.
 * @param {Object} [options.port] - Port to run the HTTP server on. Defaults to the value in the config file, or the value passed as `options.host`.
 * @param {Object} [options.host] - Hostname or IP address for the server. Defaults to the value in the config file.
 *
 * @returns {Object} Returns an object containing the Express app and routers:
 * - `app`: The main Express application instance.
 * - `staticRouter`: The Express router for serving static content.
 * - `router`: The main Express router for handling routes.
 * - `errorRouter`: The Express router for handling errors.
 *
 * @example
 * // Set up the app with default settings and custom logging options
 * const { app, staticRouter, router, errorRouter } = setup({
 *   logs: { level: 'debug' }
 * });
 *
 * @example
 * // Skip Redis and error handling setup, but still initialize middleware and session
 * const { app } = setup({
 *   redis: false,
 *   errors: false,
 *   session: { secret: 'my-secret' }
 * });
 */

const setup = (options = {
    middlewareSetupFn: undefined
}) => {
    if (options.config !== false) config.setup(options.config);

    if (options.logs !== false) logger.setup({
        ...config.get('logs'),
        ...options.logs
    });

    if (options.redis !== false) redisClient.setup({
        ...config.get('redis'),
        ...options.redis
    });

    const app = middleware.setup({
        ...config.get(),
        ...options
    });

    if (options.middlewareSetupFn && typeof options.middlewareSetupFn === 'function') {
        options.middlewareSetupFn(app);
    }

    const staticRouter = express.Router();
    app.use(staticRouter);

    if (options.session !== false) middleware.session(app, {
        ...config.get('session'),
        ...options.session
    });

    const router = express.Router();
    app.use(router);

    const errorRouter = express.Router();
    app.use(errorRouter);

    if (options.errors !== false) middleware.errorHandler(app, {
        ...config.get('errors'),
        ...options.errors
    });

    if (options.port !== false) middleware.listen(app, {
        port: options.port || config.get('port'),
        host: options.host || config.get('host'),
    });

    return { app, staticRouter, router, errorRouter };
};

module.exports = {
    setup,
    middleware,
    config,
    logger,
    redisClient,
    translation: require('./middleware/translation'),
    nunjucks: require('./middleware/nunjucks'),
    linkedFiles: require('./middleware/linked-files'),
    featureFlag: require('./middleware/feature-flag')
};
