const debug = require('debug')('hmpo-app:config');
const HmpoConfig = require('hmpo-config');

const defaultFiles = [
    'config/default.json',
    'config/default.yaml',
    'config/default.yml'
];

/**
 * Loads and merges config data from various sources including:
 * - a provided seed object,
 * - default or custom config files,
 * - environment variables,
 * - command-line arguments.
 *
 * The final configuration is stored globally in `global.GLOBAL_CONFIG`.
 * If a `timezone` is defined in the config, it sets `process.env.TZ`.
 *
 * @param {Object} [options={}] - Configuration options.
 * @param {string} [options.APP_ROOT] - The root directory for resolving relative config file paths.
 * @param {Object} [options.seed] - A pre-existing config object to use as the initial seed.
 * @param {string[]} [options.files] - An array of config file paths to load and merge.
 * @param {string} [options.envVarName='HMPO_CONFIG'] - Environment variable name containing config as a JSON/YAML string.
 * @param {string} [options.commandLineSwitch='-c'] - CLI switch used to pass a config file path.
 * @param {boolean} [options.merge=true] - Whether to merge with an existing global config.
 * @param {string[]} [options._commandLineArgs=process.argv] - Override the default CLI args (for testing).
 * @param {Object} [options._environmentVariables=process.env] - Override environment variables (for testing).
 *
 * @returns {void}
 *
 * * @example
 * // Basic usage with default config files
 * setup();
 *
 * @example
 * // Using a specific config file and disabling env var/config file merging
 * setup({
 *   files: ['config/custom.json'],
 *   merge: false
 * });
 *
 * @example
 * // Using a seed object instead of files/env/CLI
 * setup({
 *   seed: {
 *     appName: 'my-app',
 *     port: 3000
 *   }
 * });
 *
 * @example
 * // Custom environment and CLI args (for testing)
 * setup({
 *   _environmentVariables: { HMPO_CONFIG: '{"debug":true}' },
 *   _commandLineArgs: ['node', 'app.js', '-c', 'config/test.json']
 * });
 */
const setup = ({
    APP_ROOT,
    seed,
    files = defaultFiles,
    envVarName = 'HMPO_CONFIG',
    commandLineSwitch = '-c',
    merge = true,
    _commandLineArgs = process.argv,
    _environmentVariables = process.env
} = {}) => {
    const config = new HmpoConfig(APP_ROOT);

    if (seed) {
        debug('Merging with previous config');
        config.addConfig(seed);
    }

    if (!seed && merge && global.GLOBAL_CONFIG) {
        debug('Merging with previous config');
        config.addConfig(global.GLOBAL_CONFIG);
    }

    if (!seed && files) {
        debug('Adding files', files);
        files.forEach(file => config.addFile(file));
    }

    // load environment variable
    if (!seed && envVarName) {
        const envConfigText = _environmentVariables[envVarName];
        if (envConfigText) {
            debug('Adding env var', envVarName);
            config.addString(envConfigText);
        }
    }

    if (!seed && commandLineSwitch) {
        const args = _commandLineArgs.slice(2);
        while (args.length) {
            const arg = args.shift();
            if (arg === commandLineSwitch) {
                const filename = args.shift();
                debug('Adding command line file', filename);
                config.addFile(filename);
            }
        }
    }

    const configData = config.toJSON();

    // set timezone as early as possible
    if (configData.timezone) {
        _environmentVariables.TZ = configData.timezone;
    }

    global.GLOBAL_CONFIG = configData;
};

/**
 * Retrieves a value from the global config object using a dot-notation path.
 *
 * Throws an error if the config has not been loaded (i.e. `global.GLOBAL_CONFIG` is undefined).
 *
 * If no `path` is provided, the entire config object is returned.
 *
 * @param {string} [path] - A dot-separated string representing the path to the config value (e.g. `"server.port"`).
 * @param {*} [defaultIfUndefined] - A fallback value to return if the specified path is not found in the config.
 *
 * @returns {*} The value at the specified path, the default value if not found, or the full config if no path is provided.
 *
 * @throws {Error} If the config has not been loaded yet via `setup()`.
 *
 * @example
 * // Assuming global.GLOBAL_CONFIG = { server: { port: 3000 }, env: 'production' }
 *
 * get('server.port'); // returns 3000
 * get('env');         // returns 'production'
 * get('missing.key', 'defaultVal'); // returns 'defaultVal'
 * get();              // returns the entire config object
 */

const get = (path, defaultIfUndefined) => {
    if (!global.GLOBAL_CONFIG) throw new Error('Config not loaded');
    if (!path) return global.GLOBAL_CONFIG;
    const value = path.split('.').reduce((obj, part) => obj && obj[part], global.GLOBAL_CONFIG);
    return value === undefined ? defaultIfUndefined : value;
};

module.exports = Object.assign(get, {
    defaultFiles,
    setup,
    get
});
