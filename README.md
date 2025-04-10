
# hmpo-app forms framework bootstrap

## Usage

### Simple usage

```javascript
const { setup } = require('hmpo-app');
const { router } = setup();

router.use('/', require('./routes/example'));

```

### Extended usage

```javascript
const {
    setup,
    featureFlag,
    config,
    logger,
    redisClient,
    linkedFiles
} = require('hmpo-app');

const {
    app,
    staticRouter,
    router,
    errorRouter
} = setup({
    option: 'value'
});
```

See [example app](/example/) for more details

## Usage Details

## [`setup(options?)`](/index.js)

- Returned from **`require('hmpo-app')`**.
- **`setup(options)`** Bootstraps the app. Run this as early on as possible to init the logger before it is used.

### Parameters

- **`options`** (`Object`) - An object containing the options for configuring the application. Defaults to `{ middlewareSetupFn: undefined }` if not provided.

### Returns

- **`app`** - the top-level express app.
- **`staticRouter`** - an express router before session is initialised.
- **`router`** - an express router after session is initialised.
- **`errorRouter`** - an express router before the generic error handling used to handle custom errors.

### More info on the `options` Object

Any of these options (except for `config`) can also be specified in a config file. The options passed to `setup()` override the options loaded from config files.

**`config`** - if `false` no config will be loaded.

- **`APP_ROOT`** - Override app root directory detection
- **`files`** = `'config/default(.json|.yaml|.yml)'` - Array of config files to try to load. Missing files will fail silently.
- **`envVarName`** = `'HMPO_CONFIG'` - Environment variable to parse to override config values.
- **`commandLineSwitch`** = `'-c'` - Command line switch to load additional config files.
- **`merge`** = `true` - Merge new config with config from previous calls to setup.

**`env`** = `NODE_ENV` - Environment variable or `'development'`  environment.

**`port`** = `3000` - Port to bind to. If `false` the app will not listen to a port.
**`host`** = `'0.0.0.0'` - Host to bind to.

**`logs`** - See [hmpo-logger](https://github.com/HMPO/hmpo-logger/blob/master/lib/manager.js#L24) for options passed to logger. See [hmpo-logger](https://github.com/HMPO/hmpo-logger) for defaults. If `false` no logger is initialised.

**`requestLogging`** = `true` - Enable request logging (excluding public static files).

**`redis`** - If `false` redis is not initialised.

- **`connectionString`** - Connection url used for connecting to a redis instance.
- **`host`** - Host name for connecting to a redis instance.
- **`port`** = `6379` - Port for connection to a redis instance.
- **`...otherOptions`** - Any other options are passed to *`redis`*.
- If neither `connectionString` or `host` and `port` are specified, an in-memory redis is used.

**`errors`** - If `false` no error handler is set

- **`startUrl`** = `'/'` - Url to redirect to if a deep page is accessed as a new browser. Can be a `function(req, res)`.
- **`pageNotFoundView`** = `'errors/page-not-found'` - View to render for page not found.
- **`sessionEndedView`** = `'errors/session-ended'` - View to render if session is not found/expired.
- **`defaultErrorView`** = `'errors/error'` - View to render for other errors.

**`urls`**

- **`public`** = `'/public'` - Base URL for public static assets.
- **`publicImages`** = `'/public/images'` - Base URL for public sttic images.
- **`version`** = `'/version'` - Base URL for version endpoint, or `false` to disable.
- **`healthcheck`** = `'/healthcheck'` - Base URL for healthcheck endpoint, or `false` to disable.

**`publicDirs`** = `['public']` - Array of paths to mount on the public route, relative to `APP_ROOT`.
**`publicImagesDirs`** = `['assets/images']` - Array of paths to mount on the public images route, relative to `APP_ROOT`.
**`publicOptions`** = `{maxAge: 86400000}` - Options passed to the express static middleware.

**`views`** = `'views'` - Array of view directories relative to `APP_ROOT`.

**`nunjucks`** - Options passed to *`nunjucks`* templating contructor, or `false` to disable

- **`dev`** = `env==='development'` - Run *`nunjucks`* in developer mode for more verbose errors.
- **`noCache`** = `env==='development'` - Don't cache compiled template files.
- **`watch`** = `env==='development'` - Watch for changes to template files.
- **`...otherOptions`** - Any other options are passed to *`nunjucks.configure`*

**`locales`** = `'.'` - Array of locales base directories (containing a `'locales'` directory) relative to `APP_ROOT`.

**`translation`** - Options passed to [hmpo-i18n](https://github.com/HMPO/hmpo-i18n) translation library, or `false` to disable.

- **`noCache`** = `env==='development'` - Don't cache templated localisation strings.
- **`watch`** = `env==='development'` - Watch for changes to localisation files.
- **`allowedLangs`** = `['en','cy']` - Array of allowed languages.
- **`fallbackLang`** = `['en']` - Array of languages to use if translation not found is current language.
- **`cookie`** = `{name: 'lang'}` - Cookie settings to use to store current language.
- **`query`** = `'lang'` - Query parameter to use to change language, or `false` to disable.
- **`...otherOptions`** - Any other options are passed to [hmpo-i18n](https://github.com/HMPO/hmpo-i18n).

**`modelOptions`** - Configuration for model options helper to be used with [hmpo-model](https://github.com/HMPO/hmpo-model).

- **`sessionIDHeader`** = `'X-SESSION-ID'` - Session ID request header to pass through to models.
- **`scenarioIDHeader`** = `'X-SCENARIO-ID'` - Stub scenario ID request header to pass through to models.

**`helmet`** - Configuration for [Helmet](https://helmetjs.github.io/), or `false` to only use frameguard and disable `x-powered-by`.  
**`disableCompression`** = `false` - disable compression middleware.

**`cookies`** - Configuration for cookie parsing middleware.

## [`featureFlag`](/middleware/feature-flag.js)

Middleware returned from `require('hmpo-app')`.

**`getFlags(req)`** - Return all session and config feature flags.

**`isEnabled(flag, req)`** - Check if a feature flag is enabled in session or config.

**`isDisabled(flag, req)`** - Check if a feature flag is disabled in session or config.

**`redirectIfEnabled(flag, url)`** - Middleware to redirect if a flag is enabled.

**`redirectIfDisabled(flag, url)`** - Middleware to redirect if a flag is disabled.

**`routeIf(flag, handlerIf, handlerElse)`** - Middleware to run different handler depending on status of a feature flag.

### Example Usage

```javascript
const { featureFlag } = require('hmpo-app');

const enabledMiddleware = (req, res, next) => res.send('flag enabled');
const disabledMiddleware = (req, res, next) => res.send('flag disabled');

router.use(featureFlag.routeIf('flagname', enabledMiddleware, disabledMiddleware));
```

## [`config`](/lib/config.js)

### TODO - Talk About...

- defaultFiles export
- setup export (exported method)
- get export (exported method)
- How Object.assign() in config.js allows for config() or config.get(). They behave the same. config.setup(), config.defaultFiles are also made available.

A config helper returned from `require('hmpo-app')`.

### Returns

**`defaultFiles`** - An array of default config files: `[
    'config/default.json',
    'config/default.yaml',
    'config/default.yml'
];`

**`setup(configOptions?)`** - A function for config setup that takes an options Object containing possible params:

- `{
    APP_ROOT,
    seed,
    files = defaultFiles,
    envVarName = 'HMPO_CONFIG',
    commandLineSwitch = '-c',
    merge = true,
    _commandLineArgs = process.argv,
    _environmentVariables = process.env
}`
- Defaults to empty Object if no options provided.

**`get(path, defaultIfUndefined)`** - Get a value from loaded config by dot separated path, or a default if not found or undefined. If any part of the path is not found, the default will be returned.

### Example Usage

```javascript
const { config } = require('hmpo-app');

let defaultFiles = config.defaultFiles;

// Setup config
if (options.config !== false) config.setup(options.config);

const value = config.get('config.path.string', 'default value');
```

## `logger`

### TODO - Talk About...

- setup export (exported method)
- get export (exported method)
- How Object.assign() in logger.js allows for logger() or logger.get(). They behave the same. logger.setup() is also made available.

**`logger(name)`** get a new logger with an optional name

```javascript
const { logger } = require('hmpo-app');

const log = logger(':name');
log.info('log message', { req, err, other: 'metedata' });

// or

logger().info('log message', { req, err, other: 'metedata' });
```

## `redisClient`

### TODO - Talk About...

- setup export (exported method)
- getClient export (exported method)
- How Object.assign() in redis-client.js allows for redisClient() or redisClient.getClient(). They behave the same. redisClient.setup(), redisClient.client, and redisClient.close() are also made available.

**`redisClient()`** return redis client

```javascript
const { redisClient } = require('hmpo-app');
redisClient().set('key', 'value');
```
