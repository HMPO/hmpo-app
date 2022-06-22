const proxyquire = require('proxyquire').noPreserveCache();

describe('headers middleware', () => {

    let app, middleware, stubs;

    beforeEach( () => {
        app = {
            disable: sinon.stub(),
            set: sinon.stub(),
            use: sinon.stub()
        };

        stubs = {
            frameguard: sinon.stub().returns('frameguard middleware'),
            compression: sinon.stub().returns('compression middleware'),
            nocache: {
                middleware: sinon.stub().returns('nocache middleware')
            },
            compatibility: {
                middleware: sinon.stub().returns('compatibility middleware')
            }
        };

        middleware = proxyquire(APP_ROOT + '/middleware/headers', {
            'frameguard': stubs.frameguard,
            'compression': stubs.compression,
            './nocache': stubs.nocache,
            './compatibility': stubs.compatibility,
        });

    });

    context('by default', () => {

        it('should disable the x-powered-by header', () => {
            middleware.setup(app);
            app.disable.should.have.been.calledWithExactly('x-powered-by');
        });

        it('should enable trust proxy by default', () => {
            middleware.setup(app);
            app.set.should.have.been.calledWithExactly('trust proxy', true);
        });

        it('should set trust proxy to config setting', () => {
            middleware.setup(app, { trustProxy: ['loopback', 'localunique']});
            app.set.should.have.been.calledWithExactly('trust proxy', ['loopback', 'localunique']);
        });

        it('should use the returned frameguard middleware', () => {
            middleware.setup(app);
            stubs.frameguard.should.have.been.calledOnce;
            stubs.frameguard.should.have.been.calledWithExactly('sameorigin');
            app.use.should.have.been.calledWithExactly('frameguard middleware');
        });

        it('should use the nocache middleware', () => {
            middleware.setup(app);
            stubs.nocache.middleware.should.have.been.calledWithExactly({
                publicPath: '/public'
            });
            app.use.should.have.been.calledWithExactly('nocache middleware');
        });

        it('should use the nocache middleware with options', () => {
            middleware.setup(app, { publicPath: '/static' });
            stubs.nocache.middleware.should.have.been.calledWithExactly({
                publicPath: '/static'
            });
            app.use.should.have.been.calledWithExactly('nocache middleware');
        });

        it('should use the returned compression middleware', () => {
            middleware.setup(app);
            stubs.compression.should.have.been.calledOnce;
            stubs.compression.should.have.been.calledWithExactly();
            app.use.should.have.been.calledWithExactly('compression middleware');
        });

        it('should not use the returned compression middleware if compression is disabled', () => {
            middleware.setup(app, { disableCompression: true });
            stubs.compression.should.not.have.been.called;
            app.use.should.not.have.been.calledWithExactly('compression middleware');
        });

        it('should use the compatibility middleware', () => {
            middleware.setup(app);
            stubs.compatibility.middleware.should.have.been.calledWithExactly();
            app.use.should.have.been.calledWithExactly('compatibility middleware');
        });
    });
});
