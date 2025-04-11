const hmpoLogger = require('hmpo-logger');
const config = require('./config');

/**
 * Sets up the application logger using the provided options or falls back to config-defined log settings.
 *
 * This function delegates to `hmpoLogger.config()` to initialize logging behavior,
 * including log levels, output format, destinations, etc.
 *
 * @param {Object} [options=config.get('logs', {})] - Logger configuration options.
 * These can override or extend the defaults from the app config.
 *
 * @returns {void}
 *
 * @example
 * // Use default config from config.get('logs')
 * setup();
 *
 * @example
 * // Override default log level
 * setup({
 *   level: 'debug',
 *   console: true
 * });
 */

const setup = (options = config.get('logs', {})) => hmpoLogger.config(options);

/**
 * Retrieves a namespaced logger instance using `hmpo-logger`.
 *
 * This is useful for creating scoped loggers tied to specific parts of your app (e.g., modules, features).
 *
 * Increases the stack trace level to ensure logs point to the correct source line.
 *
 * @param {string} [name=':hmpo-app'] - The name or namespace for the logger (e.g. `':redis'`, `':auth'`). Defaults to `':hmpo-app'`.
 * @param {number} [level=1] - The stack trace depth offset to apply. This helps ensure logs point to the correct file/line number.
 *
 * @returns {Object} A logger instance with methods like `info`, `error`, `warn`, `debug`, etc.
 *
 * @example
 * const log = get(':redis');
 * log.info('Redis client connected');
 *
 * // Default usage
 * const log = get(); // logs will be under ':hmpo-app'
 *
 * // Adjust stack trace depth if wrapping logging logic
 * const log = get(':custom', 2);
 */

const get = (name, level = 1) => hmpoLogger.get(name || ':hmpo-app', ++level);

module.exports = Object.assign(get, {
    setup,
    get
});
