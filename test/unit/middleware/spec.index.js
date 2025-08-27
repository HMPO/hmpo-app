const proxyquire = require('proxyquire').noPreserveCache();
const express = require('express');

describe('middleware functions', () => {

    let middleware, app;

    beforeEach(() => {
        app = express();
        sinon.stub(app, 'listen').yields();
        sinon.stub(app, 'use');
        sinon.stub(app, 'set');
        sinon.stub(app, 'get');
    });

    it('exports middleware functions', () => {
        middleware = require(APP_ROOT + '/middleware');
        middleware.setup.should.be.a('function');
        middleware.session.should.be.a('function');
        middleware.errorHandler.should.be.a('function');
        middleware.listen.should.be.a('function');
    });

    describe('requiredArgument', () => {
        it('should throw an error when the required argument is not provided in session', () => {
            expect(() => middleware.session()).to.throw(Error, "Argument 'app' must be specified");
        });

        it('should throw an error when the required argument is not provided in errorHandler', () => {
            expect(() => middleware.errorHandler()).to.throw(Error, "Argument 'app' must be specified");
        });

        it('should throw an error when the required argument is not provided in listen', () => {
            expect(() => middleware.listen()).to.throw(Error, "Argument 'app' must be specified");
        });
    });

    describe('setup', () => {
        let stubs, nunjucksEnv;

        beforeEach(() => {
            nunjucksEnv = {
                addGlobal: sinon.stub()
            };
            stubs = {
                express: sinon.stub().returns(app),
                hmpoLogger: { middleware: sinon.stub().callsFake(() => (req, res, next) => next()) },
                bodyParser: { urlencoded: sinon.stub().returns((req, res, next)=>next()) },
                cookies: { middleware: sinon.stub().callsFake(() => (req, res, next)=>next()) },
                headers: { setup: sinon.stub().returns({}) },
                healthcheck: { middleware: sinon.stub().callsFake(() => (req, res, next)=>next()) },
                version: { middleware: sinon.stub().callsFake(() => (req, res, next)=>next()) },
                featureFlag: { middleware: sinon.stub().callsFake(() => (req, res, next)=>next()) },
                businessFlag: { middleware: sinon.stub().callsFake(() => (req, res, next)=>next()) },
                modelOptions: { middleware: sinon.stub().callsFake(() => (req, res, next)=>next()) },
                public: { middleware: sinon.stub().callsFake(() => (req, res, next)=>next()) },
                nunjucks: { setup: sinon.stub().returns(nunjucksEnv) },
                translation: { setup: sinon.stub() },
                hmpoComponents: { setup: sinon.stub() }
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
                './feature-flag': stubs.featureFlag,
                './business-flag': stubs.businessFlag
            });
        });

        it('should throw if setup is called without arguments', () => {
            expect(() => middleware.setup()).to.throw(Error, "Argument 'app' must be specified");
        });

        it('should not register hmpoLogger middleware if requestLogging is false', () => {
            middleware.setup({ app, urls: {}, publicOptions: {}, cookieOptions: {}, modelOptionsConfig: {}, featureFlags: {}, businessFlag: {}, requestLogging: false, stubs });
            expect(stubs.hmpoLogger.middleware).to.not.have.been.called;
            expect(app.use).to.not.have.been.calledWith(stubs.hmpoLogger.middleware);
        });

        it('should use the public middleware when publicOptions is true or not set', () => {
            middleware.setup({app,
                urls: {
                    public: '/public-url'
                },
                publicDirs: ['public'],
                publicImagesDirs: ['assets/images'],
                public: { maxAge: 3600 } // publicOptions is set
            });

            stubs.public.middleware.should.have.been.calledWithExactly({
                urls: {
                    public: '/public-url',
                    publicImages: '/public-url/images',
                    version: '/version',
                    healthcheck: '/healthcheck'
                },
                publicDirs: ['public'],
                publicImagesDirs: ['assets/images'],
                public: { maxAge: 3600 }
            });
            expect(app.use).to.not.have.been.calledWith(stubs.public.middleware);
        });

        it('should not use public middleware when publicOptions is false', () => {
            const publicOptions = false;
            const urls = {};
            const publicDirs = [];
            const publicImagesDirs = [];

            middleware.setup({app,
                urls,
                publicDirs,
                publicImagesDirs,
                public: publicOptions
            });

            stubs.public.middleware.should.not.have.been.called;
            app.use.should.not.have.been.calledWith(stubs.public.middleware);
        });

        it('should set default version and healthcheck URLs if not provided', () => {
            const urls = {};

            middleware.setup({app, urls });

            expect(urls.version).to.equal('/version');
            expect(urls.healthcheck).to.equal('/healthcheck');
        });

        it('should retain provided version and healthcheck URLs', () => {
            const urls = {
                version: '/custom-version',
                healthcheck: '/custom-healthcheck'
            };

            middleware.setup({app, urls });

            expect(urls.version).to.equal('/custom-version');
            expect(urls.healthcheck).to.equal('/custom-healthcheck');
        });

        it('should set the express env value', () => {
            middleware.setup({app});
            app.set.should.have.been.calledWithExactly('env', 'development');
        });

        it('should use the env value specified in options', () => {
            middleware.setup({app, env: 'production' });
            app.set.should.have.been.calledWithExactly('env', 'production');
        });

        it('should use the /version middleware', () => {
            middleware.setup({ app, stubs });

            expect(stubs.version.middleware).to.have.been.calledWithExactly();

            expect(app.get).to.have.been.calledWith('/version', sinon.match.func);
        });


        it('should not use the /version middleware', () => {
            middleware.setup({ app, urls: { version: false }});
            stubs.version.middleware.should.not.have.been.called;
            expect(app.get).to.not.have.been.calledWith('/version', sinon.match.func);
        });

        it('should use the /healthcheck middleware', () => {
            middleware.setup({ app, stubs });

            expect(stubs.healthcheck.middleware).to.have.been.calledWithExactly();

            expect(app.get).to.have.been.calledWith('/healthcheck', sinon.match.func);
        });

        it('should not use the /healthcheck middleware', () => {
            middleware.setup({app, urls: { healthcheck: false }});
            stubs.healthcheck.middleware.should.not.have.been.called;
            app.get.should.not.have.been.calledWithExactly('/healthcheck', sinon.match.func);
        });

        it('should use the /public middleware', () => {
            middleware.setup({app,
                urls: {
                    public: '/public-url'
                },
                publicDirs: ['public'],
                publicImagesDirs: ['assets/images'],
                public: { maxAge: 3600 }
            });
            expect(stubs.public.middleware).to.have.been.calledWith({
                urls: {
                    public: '/public-url',
                    publicImages: '/public-url/images',
                    version: '/version',
                    healthcheck: '/healthcheck'
                },
                publicDirs: ['public'],
                publicImagesDirs: ['assets/images'],
                public: { maxAge: 3600 }
            });
        });

        it('should use the hmpoLogger middleware', () => {
            middleware.setup({ app });

            expect(stubs.hmpoLogger.middleware).to.have.been.calledWith(':request');

            expect(app.use).to.have.been.calledWith(sinon.match.func);
        });

        it('should use the modelOptions middleware', () => {
            middleware.setup({
                app,
                modelOptions: { sessionIDHeader: 'ID' },
                stubs
            });

            expect(stubs.modelOptions.middleware).to.have.been.calledWithExactly({ sessionIDHeader: 'ID' });

            expect(app.use).to.have.been.calledWith(sinon.match.func);
        });

        it('should use the feature flag setup middleware', () => {
            middleware.setup({
                app,
                featureFlags: { testFeature: true },
                stubs
            });

            expect(stubs.featureFlag.middleware).to.have.been.calledWithExactly({
                featureFlags: { testFeature: true }
            });

            expect(app.use).to.have.been.calledWith(sinon.match.func);
        });


        it('should use the business flag setup middleware', () => {
            middleware.setup({
                app,
                businessFlags: { testBusinessFeatureFlag: true },
                stubs
            });

            expect(stubs.businessFlag.middleware).to.have.been.calledWithExactly({
                businessFlags: { testBusinessFeatureFlag: true }
            });

            expect(app.use).to.have.been.calledWith(sinon.match.func);
        });

        it('should use the cookies middleware', () => {
            middleware.setup({ app, cookies: { secret: 'test' } });
            expect(stubs.cookies.middleware).to.have.been.calledWithExactly({ secret: 'test' });

            expect(app.use).to.have.been.calledWith(sinon.match.func);
        });

        it('should use the body parser middleware', () => {
            middleware.setup({ app, stubs });

            expect(stubs.bodyParser.urlencoded).to.have.been.calledWithExactly({ extended: true });

            expect(app.use).to.have.been.calledWith(sinon.match.func);
        });


        it('should setup nunjucks', () => {
            middleware.setup({ app, views: 'a/dir', nunjucks: { additional: 'options' } });
            stubs.nunjucks.setup.should.have.been.calledWithExactly(app, { views: 'a/dir', additional: 'options' });
        });

        it('should setup translation', () => {
            middleware.setup({app, locales: 'a/dir', translation: { additional: 'options' } });
            stubs.translation.setup.should.have.been.calledWithExactly(app, { locales: 'a/dir', additional: 'options' });
        });

        it('should setup headers', () => {
            middleware.setup({app, disableCompression: true, trustProxy: ['localhost'], urls: { public: '/static'}, helmet: { referrerPolicy: { policy: 'no-referrer' } } });

            stubs.headers.setup.should.have.been.calledWithExactly(app, { disableCompression: true, trustProxy: ['localhost'], publicPath: '/static', helmet: { referrerPolicy: { policy: 'no-referrer' } }});
        });

        it('should setup hmpoComponents', () => {
            middleware.setup({app});
            stubs.hmpoComponents.setup.should.have.been.calledWithExactly(app, nunjucksEnv);
        });

        it('should set the globals', () => {
            app.locals = { existing: 'local' };

            middleware.setup({app,
                urls: { foo: 'bar' }
            });
            app.locals.should.deep.equal({
                existing: 'local',
                baseUrl: '/',
                assetPath: '/public',
                urls: {
                    foo: 'bar',
                    healthcheck: '/healthcheck',
                    public: '/public',
                    publicImages: '/public/images',
                    version: '/version'
                }
            });
        });

        it('should set res.locals.baseUrl to req.baseUrl during middleware setup', () => {
            const req = { baseUrl: '/test-url' };
            const res = { locals: {} };
            const next = sinon.stub();

            app.use.callsFake((middlewareFunction) => {
                if (middlewareFunction.length === 3) {
                    middlewareFunction(req, res, next);
                }
            });

            middleware.setup({ app });

            expect(res.locals.baseUrl).to.equal('/test-url');
            expect(next.called).to.be.true;
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
                businessFlag: {
                    middleware: sinon.stub().returns('businessFlag middleware')
                },
                linkedFiles: {
                    middleware: sinon.stub().returns('linkedFiles middleware')
                }
            };

            middleware = proxyquire(APP_ROOT + '/middleware', {
                './session': stubs.session,
                './feature-flag': stubs.featureFlag,
                './business-flag': stubs.businessFlag,
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

        it('should use the business flag setup middleware', () => {
            middleware.session(app);
            stubs.businessFlag.middleware.should.have.been.calledWithExactly();
            app.use.should.have.been.calledWithExactly('businessFlag middleware');
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
