const proxyquire = require('proxyquire').noPreserveCache();

describe('middleware functions', () => {

    let middleware, app;

    beforeEach( () => {
        app = {
            locals: { existing: 'local' },
            set: sinon.stub(),
            enable: sinon.stub(),
            disable: sinon.stub(),
            engine: sinon.stub(),
            use: sinon.stub(),
            get: sinon.stub(),
            listen: sinon.stub().yields()
        };
    });

    it('exports middleware functions', () => {
        middleware = require(APP_ROOT + '/middleware');
        middleware.setup.should.be.a('function');
        middleware.session.should.be.a('function');
        middleware.errorHandler.should.be.a('function');
        middleware.listen.should.be.a('function');
    });

    describe('setup', () => {
        let stubs, nunjucksEnv;

        beforeEach( () => {
            nunjucksEnv = {};
            stubs = {
                express: sinon.stub().returns(app),
                hmpoLogger: {
                    middleware: sinon.stub().returns('hmpoLogger middleware')
                },
                bodyParser: {
                    urlencoded: sinon.stub().returns('bodyParser middleware')
                },
                cookies: {
                    middleware: sinon.stub().returns('cookies middleware')
                },
                headers: {
                    setup: sinon.stub().returns({})
                },
                healthcheck: {
                    middleware: sinon.stub().returns('healthcheck middleware')
                },
                version: {
                    middleware: sinon.stub().returns('version middleware')
                },
                featureFlag: {
                    middleware: sinon.stub().returns('featureFlag middleware')
                },
                modelOptions: {
                    middleware: sinon.stub().returns('modelOptions middleware')
                },
                public: {
                    middleware: sinon.stub().returns('public middleware')
                },
                nunjucks: {
                    setup: sinon.stub().returns(nunjucksEnv)
                },
                translation: {
                    setup: sinon.stub()
                },
                hmpoComponents: {
                    setup: sinon.stub()
                }
            };

            middleware = proxyquire(APP_ROOT + '/middleware', {
                'express': stubs.express,
                'body-parser': stubs.bodyParser,
                'hmpo-logger': stubs.hmpoLogger,
                'hmpo-components': stubs.hmpoComponents,
                './nunjucks': stubs.nunjucks,
                './public': stubs.public,
                './translation': stubs.translation,
                './headers': stubs.headers,
                './healthcheck': stubs.healthcheck,
                './model-options': stubs.modelOptions,
                './version': stubs.version,
                './cookies': stubs.cookies,
                './feature-flag': stubs.featureFlag
            });

        });

        it('should create a new express app', () => {
            const returnedApp = middleware.setup();
            stubs.express.should.have.been.calledWithExactly();
            returnedApp.should.equal(app);
        });

        it('should set the express env value', () => {
            middleware.setup();
            app.set.should.have.been.calledWithExactly('env', 'development');
        });

        it('should use the env value specified in options', () => {
            middleware.setup({env: 'production'});
            app.set.should.have.been.calledWithExactly('env', 'production');
        });


        it('should use the /version middleware', () => {
            middleware.setup();
            stubs.version.middleware.should.have.been.calledWithExactly();
            app.get.should.have.been.calledWithExactly('/version', 'version middleware');
        });

        it('should use the /healthcheck middleware', () => {
            middleware.setup();
            stubs.healthcheck.middleware.should.have.been.calledWithExactly();
            app.get.should.have.been.calledWithExactly('/healthcheck', 'healthcheck middleware');
        });

        it('should use the /public middleware', () => {
            middleware.setup({
                urls: {
                    public: '/public-url'
                },
                publicDirs: ['public'],
                publicImagesDirs: ['assets/images']
            });
            stubs.public.middleware.should.have.been.calledWithExactly({
                urls: {
                    public: '/public-url',
                    publicImages: '/public-url/images',
                    govukAssetPath: '/public-url/govuk-assets',
                    version: '/version',
                    healthcheck: '/healthcheck'
                },
                publicDirs: ['public'],
                publicImagesDirs: ['assets/images']
            });
            app.use.should.have.been.calledWithExactly('public middleware');
        });

        it('should use the hmpoLogger middleware', () => {
            middleware.setup();
            stubs.hmpoLogger.middleware.should.have.been.calledWithExactly(':request');
            app.use.should.have.been.calledWithExactly('hmpoLogger middleware');
        });

        it('should use the modelOptions middleware', () => {
            middleware.setup({ modelOptions: { sessionIDHeader: 'ID' } });
            stubs.modelOptions.middleware.should.have.been.calledWithExactly({ sessionIDHeader: 'ID' });
            app.use.should.have.been.calledWithExactly('modelOptions middleware');
        });

        it('should use the feature flag setup middleware', () => {
            middleware.setup({
                featureFlags: { testFeature: true }
            });
            stubs.featureFlag.middleware.should.have.been.calledWithExactly({
                featureFlags: { testFeature: true }
            });
            app.use.should.have.been.calledWithExactly('featureFlag middleware');
        });

        it('should use the cookies middleware', () => {
            middleware.setup({ cookies: { secret: 'test' } });
            stubs.cookies.middleware.should.have.been.calledWithExactly({ secret: 'test' });
            app.use.should.have.been.calledWithExactly('cookies middleware');
        });

        it('should use the body parser middleware', () => {
            middleware.setup();
            stubs.bodyParser.urlencoded.should.have.been.calledWithExactly({ extended: true });
            app.use.should.have.been.calledWithExactly('bodyParser middleware');
        });

        it('should setup nunjucks', () => {
            middleware.setup({ views: 'a/dir', nunjucks: { additional: 'options' } });
            stubs.nunjucks.setup.should.have.been.calledWithExactly(app, { views: 'a/dir', additional: 'options' });
        });

        it('should setup translation', () => {
            middleware.setup({ locales: 'a/dir', translation: { additional: 'options' } });
            stubs.translation.setup.should.have.been.calledWithExactly(app, { locales: 'a/dir', additional: 'options' });
        });

        it('should setup headers', () => {
            middleware.setup({ disableCompression: true, trustProxy: ['localhost'], urls: { public: '/static'} });

            stubs.headers.setup.should.have.been.calledWithExactly(app, { disableCompression: true, trustProxy: ['localhost'], publicPath: '/static'});
        });

        it('should setup hmpoComponents', () => {
            middleware.setup();
            stubs.hmpoComponents.setup.should.have.been.calledWithExactly(app, nunjucksEnv);
        });

        it('should set the globals', () => {
            middleware.setup({
                urls: { foo: 'bar' }
            });
            app.locals.should.deep.equal({
                existing: 'local',
                baseUrl: '/',
                assetPath: '/public',
                govukAssetPath: '/public/govuk-assets',
                urls: {
                    foo: 'bar',
                    govukAssetPath: '/public/govuk-assets',
                    healthcheck: '/healthcheck',
                    public: '/public',
                    publicImages: '/public/images',
                    version: '/version'
                }
            });
        });
    });

    describe('session', () => {
        let stubs;

        beforeEach( () => {
            stubs = {
                session: {
                    middleware: sinon.stub().returns('session middleware')
                },
                featureFlag: {
                    middleware: sinon.stub().returns('featureFlag middleware')
                },
                linkedFiles: {
                    middleware: sinon.stub().returns('linkedFiles middleware')
                }
            };

            middleware = proxyquire(APP_ROOT + '/middleware', {
                './session': stubs.session,
                './feature-flag': stubs.featureFlag,
                './linked-files': stubs.linkedFiles
            });
        });

        it('should use session middleware', () => {
            middleware.session(app, { secret: 'qwerty' });
            stubs.session.middleware.should.have.been.calledWithExactly({
                secret: 'qwerty'
            });
            app.use.should.have.been.calledWithExactly('session middleware');
        });

        it('should use the feature flag setup middleware', () => {
            middleware.session(app);
            stubs.featureFlag.middleware.should.have.been.calledWithExactly();
            app.use.should.have.been.calledWithExactly('featureFlag middleware');
        });

        it('should use the linked files middleware', () => {
            middleware.session(app, { ttl: 10 });
            stubs.linkedFiles.middleware.should.have.been.calledWithExactly({ ttl: 10 });
            app.use.should.have.been.calledWithExactly('linkedFiles middleware');
        });
    });

    describe('errorHandler', () => {
        let stubs;

        beforeEach( () => {
            stubs = {
                pageNotFound: {
                    middleware: sinon.stub().returns('pageNotFound middleware')
                },
                errorHandler: {
                    middleware: sinon.stub().returns('errorHandler middleware')
                }
            };

            middleware = proxyquire(APP_ROOT + '/middleware', {
                './page-not-found': stubs.pageNotFound,
                './error-handler': stubs.errorHandler
            });
        });

        it('should use the pageNotFound middleware', () => {
            middleware.errorHandler(app, { foo: 'bar' });
            stubs.pageNotFound.middleware.should.have.been.calledWithExactly({ foo: 'bar' });
            app.use.should.have.been.calledWithExactly('pageNotFound middleware');
        });

        it('should use the errorHandler middleware', () => {
            middleware.errorHandler(app, { foo: 'bar' });
            stubs.errorHandler.middleware.should.have.been.calledWithExactly({ foo: 'bar' });
            app.use.should.have.been.calledWithExactly('errorHandler middleware');
        });
    });


    describe('listen', () => {
        beforeEach( () => {
            middleware = require(APP_ROOT + '/middleware');
        });

        it('should listen on the default host and port', () => {
            middleware.listen(app);
            app.listen.should.have.been.calledWith(3000, '0.0.0.0');
        });

        it('should listen on the specified host and port', () => {
            middleware.listen(app, { host: 'hostname', port: 8888 });
            app.listen.should.have.been.calledWith(8888, 'hostname');
        });
    });

});
