const redis = require('redis');
const logger = require('./logger');
const config = require('./config');

const setup = ({
    connectionString,
    host = '127.0.0.1',
    port,
    ...redisOptions
} = config.get('redis', {})) => {
    const hostname = require('os').hostname().split('.')[0];
    const clientName = config.get('APP_NAME') + ':' + hostname + ':' + (process.env.pm_id || '0');
    const log = logger.get(':redis');

    if (redisClient.client) close();

    if (connectionString) {
        redisClient.client = redis.createClient(connectionString, redisOptions);
    } else if (host && port) {
        redisClient.client = redis.createClient(port, host, redisOptions);
    }

    if (redisClient.client) {
        redisClient.client.client('SETNAME', clientName);
        redisClient.client.once('ready', () => log.info('Connected to Redis'));
    }

    if (!redisClient.client) {
        log.info('Using In-memory Redis - sessions will be lost on restarts');
        const fakeRedis = require('fakeredis');
        redisClient.client = fakeRedis.createClient();
    }

    redisClient.client.on('error', err => {
        log.error('Redis error :message', { err });
        throw err;
    });

    return redisClient.client;
};

const getClient = () => redisClient.client;

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
