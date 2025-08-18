const index = require(APP_ROOT);
const express = require('express');
const sinon = require('sinon');

describe('hmpo-app', () => {

    it('should export setup functions and libs', () => {
        index.should.contain.all.keys([
            'setup',
            'middleware',
            'config',
            'logger',
            'redisClient',
            'translation',
            'nunjucks',
            'linkedFiles',
            'featureFlag',
            'businessFlag'
        ]);
    });

    describe('setup', () => {
        beforeEach(() => {
            sinon.stub(express, 'Router');
            express.Router.onCall(0).returns(sinon.stub());
            express.Router.onCall(1).returns(sinon.stub());
            express.Router.onCall(2).returns(sinon.stub());

            sinon.stub(index.config, 'get');
            sinon.stub(index.config, 'setup');
            sinon.stub(index.logger, 'setup');
            sinon.stub(index.redisClient, 'setup');

            sinon.stub(index.middleware, 'setup').callsFake(({ app }) => app);
            sinon.stub(index.middleware, 'session').callsFake(() => {});
            sinon.stub(index.middleware, 'errorHandler').callsFake(() => {});
            sinon.stub(index.middleware, 'listen').callsFake(() => {});
        });

        afterEach(() => {
            sinon.restore();
        });

        it('should work when called without options', () => {
            const result = index.setup();
            result.should.have.keys('app', 'staticRouter', 'router', 'errorRouter');
        });

        it('calls config.setup', () => {
            index.setup({});
            index.config.setup.should.have.been.calledWithExactly(undefined);
        });

        it('calls config.setup with options', () => {
            index.setup({ config: { option: true} });
            index.config.setup.should.have.been.calledWithExactly({ option: true });
        });

        it('should not call config.setup if option is false', () => {
            index.setup({ config: false });
            index.config.setup.should.not.have.been.called;
        });

        it('calls logger.setup with options', () => {
            index.config.get.withArgs('logs').returns({ config: true });
            index.setup({ logs: { option: true } });
            index.logger.setup.should.have.been.calledWithExactly({
                option: true,
                config: true
            });
        });

        it('should not call logger.setup if option is false', () => {
            index.setup({ logs: false });
            index.logger.setup.should.not.have.been.called;
        });

        it('calls redisClient.setup with options', () => {
            index.config.get.withArgs('redis').returns({ config: true });
            index.setup({ redis: { option: true } });
            index.redisClient.setup.should.have.been.calledWithExactly({
                option: true,
                config: true
            });
        });

        it('should not call redisClient.setup if option is false', () => {
            index.setup({ redis: false });
            index.redisClient.setup.should.not.have.been.called;
        });

        it('calls middleware.setup with options', () => {
            index.config.get.withArgs().returns({ config: true });
            const result = index.setup({ option: true });
            index.middleware.setup.should.have.been.calledWithMatch({
                app: result.app,
                option: true,
                config: true
            });
        });

        it('calls middleware.session with options', () => {
            index.config.get.withArgs('session').returns({ config: true });
            const result = index.setup({ session: { option: true } });
            index.middleware.session.should.have.been.calledWithExactly(
                result.app,
                { option: true, config: true }
            );
        });

        it('should not call middleware.session if option is false', () => {
            index.setup({ session: false });
            index.middleware.session.should.not.have.been.called;
        });

        it('calls middleware.errorHandler with options', () => {
            index.config.get.withArgs('errors').returns({ config: true });
            const result = index.setup({ errors: { option: true } });
            index.middleware.errorHandler.should.have.been.calledWithExactly(
                result.app,
                { option: true, config: true }
            );
        });

        it('should not call middleware.errorHandler if option is false', () => {
            index.setup({ errors: false });
            index.middleware.errorHandler.should.not.have.been.called;
        });

        it('should call globalMiddlewareSetupFn if option is defined', () => {
            const callbackSpy = sinon.spy();

            index.setup({ globalMiddlewareSetupFn: callbackSpy });

            callbackSpy.should.have.been.calledWithMatch(
                sinon.match.has('use').and(sinon.match.has('get'))
            );
        });

        it('should not call globalMiddlewareSetupFn if option is not defined', () => {
            const callbackStub = sinon.stub();
            index.setup({});
            callbackStub.should.not.have.been.called;
        });

        it('should call middlewareSetupFn if option is defined', () => {
            const callbackSpy = sinon.spy();

            index.setup({ middlewareSetupFn: callbackSpy });

            callbackSpy.should.have.been.calledWithMatch(
                sinon.match.has('use').and(sinon.match.has('get'))
            );
        });

        it('should call globalMiddlewareSetupFn and middlewareSetupFn if option is defined', () => {
            const callbackSpy = sinon.spy();
            const callbackSpy2 = sinon.spy();
            index.setup({
                globalMiddlewareSetupFn: callbackSpy,
                middlewareSetupFn: callbackSpy2  });

            callbackSpy.should.have.been.calledWithMatch(
                sinon.match.has('use').and(sinon.match.has('get'))
            );
            callbackSpy2.should.have.been.calledWithMatch(
                sinon.match.has('use').and(sinon.match.has('get'))
            );
        });

        it('should not call middlewareSetupFn if option is not defined', () => {
            const callbackStub = sinon.stub();
            index.setup({});
            callbackStub.should.not.have.been.called;
        });

        it('calls middleware.listen with options', () => {
            index.config.get.withArgs('host').returns('hostname');
            index.config.get.withArgs('port').returns(1234);
            const result = index.setup({ port: 5678 });
            index.middleware.listen.should.have.been.calledWithExactly(result.app, {
                port: 5678,
                host: 'hostname'
            });
        });

        it('should not call middleware.listen if port is false', () => {
            index.setup({ port: false });
            index.middleware.listen.should.not.have.been.called;
        });

        it('returns apps and routers', () => {
            const result = index.setup({});
            result.should.eql({
                app: result.app,
                staticRouter: express.Router.getCall(0).returnValue,
                router: express.Router.getCall(1).returnValue,
                errorRouter: express.Router.getCall(2).returnValue
            });
        });
    });
});
