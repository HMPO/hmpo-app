
# hmpo-app forms framework bootstrap

## Usage

### Simple usage
```
const { setup } = require('hmpo-app');
const { router } = setup();

router.use('/', require('./routes/example'));

```

### Extended usage
```
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


See example app for more details

## setup()

Bootstrap the app. run this as early on as possible to init the logger before it is used.

### Options


- `app` express app can be passed in. Default: a new `app` is created
- `env` production/development environment. Default: using the `NODE_ENV` environment variable or `'development'`
- `listen` if `false` the app will not bind
    - `host` host to bind to. Default: `host` config value or `'0.0.0.0'`
    - `port` port to bind to. Default: `port` config value or `3000`
- `config` if `false` no config will be loaded
    - `APP_ROOT` override app root directory detection
    - `files` array of config files to try to load. Missing files will fail silently. Default: `config/default(.json|.yaml|.yml)` 
    - `envVarName` environment variable to parse to override config values. Default: `'HMPO_CONFIG'`
    - `commandLineSwitch` command line switch to load additional config files. Default: `'-c'`
    - `merge` merge calls config setup with previous calls. Default: `true`
- `logger` options passed to `hmpo-logger`. If `false` no logger is initialised. Default: `logs` config object
- `redis` if `false` redis is not initialised. Default: `redis` config object
    - `connectionString` connection url used for connecting to redis
    - `host` host name for connecting to redis. Default: `127.0.0.1`
    - `port` port for connection to redis
    - `...redisOptions` any other options are passed to `redis`
    - If neither `connectionString` or `host` and `port` are specified an in-memory redis is used
- `errors` if `false` no error handler is set. Default: `errors` config object
    - `startUrl` url to redirect to if a deep page is accessed as a new browser. Can be a `function(req, res)`. Default: `'/'`
    - `pageNotFoundView` view to render for page not found. Default: `'errors/page-not-found'`
    - `sessionEndedView` view to render if session is not found/expired. Default: `'errors/session-ended'`
    - `defaultErrorView` view to render for other errors. Default: `'errors/error'`
- `publicPath` base URL for public static assets. Default: `urls.public` config value or `/public`
- `publicImagesPath` base URL for public sttic images. Default `urls.publicImages` config value or `/public/images`,
- `govukAssetPath` base URL for govuk-frontend static assets. Default `urls.govukAssetPath` config value or `/public/govuk-assets`,
- `publicDirs` array of paths to mount on the public route, relative to APP_ROOT. Default: `publicDirs` config array or `['public']`
- `publicImagesDirs` array of paths to mount on the public images route, relative to APP_ROOT. Default: `publicImagesDir` config array or `['assets/images']`
- `staticOptions` options passed to the express static middleware. Default `staticOptions` config object or `{maxAge: 86400000}`
- `disableCompression` disable compression middleware. Default: `disableCompression` config value or `false`
- `versionPath` base URL for version endpoint, or `false` to disable. Default: `urls.version` config value or `'/version'`
- `healthcheckPath` base URL for healthcheck endpoint, or `false` to disable. Default: `urls.healthcheck` config value or `'/healthcheck'`
- `requestLogging` enable request logging (excluding static assets). Default: `logs.requestLogging` config value or `true`
- `views` array of view directories relative to APP_ROOT. Default: `views` config array or `['views']`
- `nunjucks` options passed to `nunjucks` templatinng contructor, or `false` to disable . Default: `nunjucks` config object
    - `dev` run nunjucks in developer mode for more verbose errors. Default: `env==='development'`
    - `noCache` don't cache compiled template files. Default: `env==='development'`
    - `watch` watch for changes to template files. Default: `env==='development'`
- `locales` array of locales base directories (containing a `'locales'` directory) relative to APP_ROOT. Default: `locales` config array or `['.']`
- `translation` options passed to `hmpo-i18n` translation library, or `false` to disable. Default: `translation` config object
    - `noCache` don't cache templated localisation strings. Default: `env==='development'`
    - `watch` watch for changes to localisation files. Default: `env==='development'`
    - `allowedLangs` array of allowed languages. Default: `['en','cy']`
    - `fallbackLang` array of languages to use if translation not found is current language. Default: `['en']`
    - `cookie` cookie settings to use to store current language. Default: `{name: 'lang'}`
    - `query` query parameter to use to change language, or `false` to disable. Default: `'lang'`
- `modelOptions` configuration for model options helper to be used with `hmpo-model`. Default: `modelOptions` config object
    - `sessionIDHeader` session ID request header to pass through to models. Default: `'X-SESSION-ID'`
    - `scenarioIDHeader` stub scenario ID request header to pass through to models. Default: `'X-SCENARIO-ID'`
- `cookies` configuration for cookies middleware. Default: `cookies` config object

### returned values

- `app` the top-level express app
- `staticRouter` an express router before session is initialised
- `router` an express router after session is initialised
- `errorRouter` an express router before the generic error handling used to handle custom errors

## featureFlag

- `getFlags(req)` return all session and config feature flags
- `isEnabled(flag, req)` check if a feature flag is enabled in session or config
- `isDisabled(flag, req)` check if a feature flag is disabled in session or config
- `redirectIfEnabled(flag, url)` middleware to redirect if a flag is enabled
- `redirectIfDisabled(flag, url)` middleware to redirect if a flag is disabled
- `routeIf(flag, handlerIf, handlerElse)` middleware to run different handler depending on status of a feature flag

```
const { featureFlag } = require('hmpo-app');

const enabledMiddleware = (req, res, next) => res.send('flag enabled');
const disabledMiddleware = (req, res, next) => res.send('flag disabled');

router.use(featureFlag.routeIf('flagname', enabledMiddleware, disabledMiddleware));
```

## config

- `config(path, defaultIfUndefined)` get a value from loaded config by dot separated path, or a default if not found or undefined. Id any part of the path is not found, the default will be returned.

```
const { config } = require('hmpo-app');
const value = config.get('config.path.string', 'default value');
```
## logger

- `logger(name)` get a new logger with an optional name

```
const { logger } = require('hmpo-app');

const log = logger(':name');
log.info('log message', { req, err, other: 'metedata' });

// or

logger().info('log message', { req, err, other: 'metedata' });
```

## redisClient

- `redisClient()` return redis client

```
const { redisClient } = require('hmpo-app');
redisClient().set('key', 'value');
```
