
# hmpo-app forms framework bootstrap

> **NOTE:**
> `hmpo-app` **v5.0.2 and above** uses [GOV.UK Frontend v5+](https://github.com/alphagov/govuk-frontend), which requires [ECMAScript Modules (ESM)](https://nodejs.org/api/esm.html) and a modern JavaScript bundler.
>
> ### How to Bundle ESM JavaScript
>
> You must use a JavaScript bundler (such as **Rollup**, **Webpack**, or **Vite**) that supports ESM.
> Directly including these modules in `<script>` tags in browsers is **not supported**.
>
> **If your project or its dependencies use a mix of CommonJS (CJS) and ESM modules, you will need to configure Rollup with additional plugins to ensure everything is bundled correctly.**
>
> #### 1. Install dependencies
>
> ```bash
> npm install --save-dev rollup @rollup/plugin-commonjs @rollup/plugin-node-resolve @rollup/plugin-terser
> ```
>
> #### 2. Example entry file (`assets/javascripts/app.js`)
>
> ```js
> import { initAll } from 'govuk-frontend';
> import 'hmpo-components/all.js';
>
> // ...your custom JS here
>
> initAll();
> ```
>
> #### 3. Example Rollup config (`rollup.config.mjs`)
>
> ```js
> import commonjs from '@rollup/plugin-commonjs';
> import { nodeResolve } from '@rollup/plugin-node-resolve';
> import terser from '@rollup/plugin-terser';
>
> export default {
>   input: 'assets/javascripts/app.js',
>   output: {
>     file: 'public/javascripts/application.js',
>     format: 'esm',
>     sourcemap: true,
>   },
>   plugins: [
>     nodeResolve(),
>     commonjs(),
>     terser()
>   ],
> };
> ```
>
> #### 4. Add a build script to your `package.json`
>
> ```json
> "scripts": {
>   "build:js": "mkdir -p public/javascripts && rollup -c"
> }
> ```
>
> Build your bundle with:
>
> ```bash
> npm run build:js
> ```
>
> #### 5. Include the bundle in your HTML
>
> ```html
> <script type="module" src="/public/javascripts/application.js"></script>
> ```
>
> ---
>
> If you previously included scripts directly with `<script>`, you will need to update your build pipeline to use ESM and a bundler.
>
> _For more options and troubleshooting, see the [Rollup documentation](https://rollupjs.org/) and plugin docs._



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
    businessFlag,
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

## [`businessFlag`](/middleware/business-flag.js)

Middleware returned from `require('hmpo-app')`.

**`getFlags(req)`** - Return all session and config business flags.

**`isEnabled(flag, req)`** - Check if a business flag is enabled in session or config.

**`isDisabled(flag, req)`** - Check if a business flag is disabled in session or config.

**`redirectIfEnabled(flag, url)`** - Middleware to redirect if a flag is enabled.

**`redirectIfDisabled(flag, url)`** - Middleware to redirect if a flag is disabled.

**`routeIf(flag, handlerIf, handlerElse)`** - Middleware to run different handler depending on status of a feature flag.

### Example Usage

```javascript
const { business } = require('hmpo-app');

const enabledMiddleware = (req, res, next) => res.send('flag enabled');
const disabledMiddleware = (req, res, next) => res.send('flag disabled');

router.use(business.routeIf('flagname', enabledMiddleware, disabledMiddleware));
```

#### Feature Flag & Business Flag Semantic Differences:

- Feature Flags are typically used for technical or deployment toggles, like enabling a new logging format or switching between frontend flows. Feature Flags are meant to be temporary.

- Business Flags are used for controling policy-driven or operational logic, service variation, or business rule change. Business Flags are meant to be semi-permenant, until the business says otherwise.

## [`config`](/lib/config.js)

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

**`get(path, defaultIfUndefined)` / `config(path, defaultIfUndefined)`** - Get a value from loaded config by dot separated path, or a default if not found or undefined. If any part of the path is not found, the default will be returned.

### Example Usage

```javascript
const { config } = require('hmpo-app');

let defaultFiles = config.defaultFiles;

// Setup config
if (options.config !== false) config.setup(options.config);

const value = config.get('config.path.string', 'default value');
```

Due to the way [config.js](/lib/config.js) uses `Object.assign()`, you can use `config(path, defaultIfUndefined)` and `config.get(path, defaultIfUndefined)` interchangeably - depending on which you find better for readability.

E.g.

```javascript
const value = config('config.path.string', 'default value');

// OR

const value = config.get('config.path.string', 'default value');
```

## [`logger`](/lib/logger.js)

### Returns

**`setup(options?)`** - Setup the logger by passing an options `Object`. If no options are supplied it will default to checking `config.get('logs', {})`. This passes the provided options directly to `hmpoLogger.config()`.

**`get(name?, level?)` / `logger(name?, level?)`** - Get a new logger with an optional name (defaults to `:hmpo-app`) and an optional level (defaults to `1`).

### Example Usage

```javascript
const { logger } = require('hmpo-app');

logger.setup(); // Setup from config.

// or

logger.setup({ foo: 'bar' });   // Setup from options

const log = logger(':name');

log.info('log message', { req, err, other: 'metedata' });

// or

logger().info('log message', { req, err, other: 'metedata' });
```

Due to the way [logger.js](/lib/logger.js) uses `Object.assign()`, you can use `logger(name)` and `logger.get(name)` interchangeably - depending on which you find better for readability.

E.g.

```javascript
const myLogger1 = logger('logger1');

// OR

const myLogger2 = logger.get('logger2');
```

## [`redisClient`](/lib/redis-client.js)

### Returns

**`redisClient()` / `getClient()`** - Returns a redis client.

**`client`** - The redisClient, defaults to `null`.

**`setup(options?)`** - Returns a modified `redisClient.client`.

- Closes an existing client using provided `close()` and creates a new one using the provided options.
- All options are passed to `redis.createClient()`. See [Node Redis Docs](https://redis.io/docs/latest/develop/clients/nodejs/) for more info.
- If no `options` specified, this will default to checking `config.get('redis', {})`.
- `options` assumes the following parameters: `{ connectionString, host, port = 6379, ...redisOptions }`

**`close(callback)`** - Quits a redisClient if it exists / is connected, then sets `redisClient.client = null`. Finally, fires the provided callback function.

Due to the way [redis-client.js](/lib/redis-client.js) uses `Object.assign()`, you can use `redisClient()` and `redisClient.getClient()` interchangeably - depending on which you find better for readability.

### Example Usage

```javascript
const { redisClient } = require('hmpo-app');

// Setup the Redis client
redisClient.setup({
    connectionString: 'redis://localhost:6379',
    // OR
    host: 'localhost',
    port: 6379,
    // Optional: any other redis.createClient options
    socket: {
        reconnectStrategy: retries => Math.min(retries * 50, 2000)
    }
});

// Get the Redis client instance
const client = redisClient(); // same as redisClient.getClient()

client.set('foo', 'bar');
client.get('foo').then(console.log); // Outputs: bar

// Gracefully close the client when shutting down
redisClient.close(() => {
    console.log('Redis connection closed');
});
```

## Further Examples

- The [example app](/example/).
- The [hmpo-logger](https://github.com/HMPO/hmpo-logger/blob/5c69e2df6e7c8db6f4642efae5d7fb283e0c7aad/README.md?plain=1#L20) library.
- The [hmpo-components](https://github.com/HMPO/hmpo-components/blob/3f7c5c97be49c4067877f6d2056b6369909bef17/README.md?plain=1#L24) library.
