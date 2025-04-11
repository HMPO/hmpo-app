const redis = require('redis');
const logger = require('./logger');
const config = require('./config');

/**
 * Sets up a Redis client instance, using either a provided connection string or host/port options.
 *
 * If a client is already connected, it is closed before creating a new one. The client is stored as a singleton on `redisClient.client`.
 *
 * If no connection can be established with a real Redis instance, the function falls back to an in-memory client using `fakeredis`.
 *
 * Automatically sets the Redis client name using the app name, hostname, and PM2 process ID (if present).
 *
 * @param {Object} [options=config.get('redis', {})] - Configuration options for Redis connection.
 * @param {string} [options.connectionString] - A full Redis connection URL (e.g. `redis://localhost:6379`).
 * @param {string} [options.host] - Redis server hostname (used with `port` if no `connectionString` is provided).
 * @param {number} [options.port=6379] - Redis server port.
 * @param {Object} [options.socket] - Optional socket-related configuration (e.g. `reconnectStrategy`, `tls`).
 * @param {string} [options.password] - Redis password for authentication, if required.
 * @param {boolean} [options.tls] - Whether to enable TLS (can also be configured via `socket` options).
 * @param {Object} [options.<anyOtherOption>] - Any additional option supported by `redis.createClient()`.
 *
 * @returns {import('redis').RedisClientType} A configured and connected Redis client instance.
 *
 * @example
 * // Use default config from the application's config system
 * const client = redisClient.setup();
 *
 * @example
 * // Provide a connection string explicitly
 * const client = redisClient.setup({
 *   connectionString: 'redis://localhost:6379'
 * });
 *
 * @example
 * // Provide host and port with custom socket options
 * const client = redisClient.setup({
 *   host: 'redis.example.com',
 *   port: 6380,
 *   socket: {
 *     reconnectStrategy: retries => Math.min(retries * 50, 2000)
 *   }
 * });
 *
 * @example
 * // If Redis is unavailable, setup will fall back to fakeredis
 * const client = redisClient.setup();
 * client.set('foo', 'bar'); // Works in-memory
 */
const setup = ({
    connectionString,
    host,
    port = 6379,
    ...redisOptions
} = config.get('redis', {})) => {
    const hostname = require('os').hostname().split('.')[0];
    const clientName = config.get('APP_NAME') + ':' + hostname + ':' + (process.env.pm_id || '0');
    const log = logger.get(':redis');

    if (redisClient.client) close();

    redisOptions.legacyMode = true;

    if (connectionString) {
        redisOptions.url = connectionString;
    }
    if (host && port) {
        redisOptions.socket = Object.assign({}, { host, port }, redisOptions.socket);
    }

    if (redisOptions.url || redisOptions.socket) {
        redisClient.client = redis.createClient(redisOptions);
    }

    if (redisClient.client) {
        redisClient.client.on('connect', () => {
            log.info('Connected to redis');
            redisClient.client.sendCommand('CLIENT', ['SETNAME', clientName]);
        });
        redisClient.client.on('reconnecting', () => {
            log.info('Reconnecting to redis');
        });
        redisClient.client.on('error', e => {
            log.error('Redis error', e);
        });

        redisClient.client.connect();
    }

    if (!redisClient.client) {
        log.info('Using In-memory Redis - sessions will be lost on restarts');
        const fakeRedis = require('fakeredis');
        redisClient.client = fakeRedis.createClient();

        redisClient.client.on('error', e => {
            log.error('Redis error', e);
        });
    }

    return redisClient.client;
};

/**
 * Returns the current Redis client instance.
 *
 * This will either be:
 * - a real Redis client created by `redis.createClient()`, or
 * - an in-memory client from `fakeredis`, if Redis was unavailable during setup.
 *
 * @returns The Redis client instance, or `null` if it hasn't been set up yet.
 *
 * @example
 * const client = redisClient.getClient();
 * if (client) {
 *   await client.set('key', 'value');
 * }
 */

const getClient = () => redisClient.client;

/**
 * Closes the current Redis client connection, if it is active, and sets the client to `null`.
 *
 * If a callback function is provided, it will be called when the Redis client successfully closes the connection.
 * The client is considered closed if it is disconnected or if the `quit` command has been issued.
 *
 * If the Redis client is not connected or hasn't been initialized, the method will simply set the client to `null` and invoke the callback, if provided.
 *
 * @param {Function} [cb] - An optional callback function to be invoked once the Redis client has successfully closed.
 * It will be called with no arguments.
 *
 * @returns {void}
 *
 * @example
 * // Close the Redis client and log a message when done
 * redisClient.close(() => {
 *   console.log('Redis client closed.');
 * });
 */
const close = (cb) => {
    if (!redisClient.client || !redisClient.client.connected) {
        redisClient.client = null;
        if (cb) cb();
        return;
    }

    if (cb) redisClient.client.once('end', cb);
    redisClient.client.quit();
    redisClient.client = null;
};

const redisClient = module.exports = Object.assign(getClient, {
    client: null,
    setup,
    getClient,
    close
});
