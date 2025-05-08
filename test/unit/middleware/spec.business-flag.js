const businessFlag = require(APP_ROOT + '/middleware/business-flag');

describe('Business Flag', () => {
    let options;
    let middleware;
    let req;
    let res;
    let next;

    beforeEach(() => {
        options = {
            businessFlags: {
                flagFromConfig: true
            }
        };

        req = {
            businessFlags: {
                enabledFlag: true,
                disabledFlag: false
            },
            session: {
                businessFlags: {
                    flagFromSession: true
                }
            }
        };

        res = require('hmpo-reqres').res();
        res.redirect = sinon.stub();
        next = sinon.stub();

        middleware = businessFlag.middleware(options);
    });

    describe('#middleware', () => {
        it('should copy options.businessFlags and session.businessFlags to req.businessFlags', () => {
            middleware(req, res, next);

            req.businessFlags.should.deep.equal({
                enabledFlag: true,
                disabledFlag: false,
                flagFromConfig: true,
                flagFromSession: true
            });
        });

        it('should ignore nonexistant business flag sources', () => {
            middleware = businessFlag.middleware();
            delete req.businessFlags;
            delete req.session;

            middleware(req, res, next);

            req.businessFlags.should.deep.equal({});
        });

        it('should deep clone businessFlags', () => {
            middleware(req, res, next);

            req.businessFlags.should.not.equal(options.businessFlags);
            req.businessFlags.should.not.equal(req.session.businessFlags);
            req.businessFlags.flagFromConfig = false;
            options.businessFlags.flagFromConfig.should.be.true;
        });

        it('should keep existing object reference', () => {
            const originalFlags = { originalFlag: true };
            req.businessFlags = originalFlags;
            middleware(req, res, next);
            req.businessFlags.should.equal(originalFlags);
            req.businessFlags.originalFlag.should.be.true;
            req.businessFlags.flagFromConfig.should.be.true;
        });

        it('should set the res.locals.businessFlags object to the updated businessflags', () => {
            req.businessFlags = { originalFlag: true };
            middleware(req, res, next);
            res.locals.businessFlags.should.deep.equal({
                originalFlag: true,
                flagFromConfig: true,
                flagFromSession: true
            });
        });

        it('should call next with no arguments', () => {
            middleware(req, res, next);
            next.should.have.been.calledWithExactly();
        });
    });

    describe('#getFlags', () => {
        it('should return the current flags from the req', () => {
            businessFlag.getFlags(req).should.deep.equal({
                enabledFlag: true,
                disabledFlag: false,
            });
        });

        it('should return en empty object if there are no flags in the req', () => {
            delete req.businessFlags;
            businessFlag.getFlags(req).should.deep.equal({});
        });

        it('should not cache flag results', () => {
            req.businessFlags.varyingFlag = true;

            let flags = businessFlag.getFlags(req);
            flags.varyingFlag.should.equal(true);

            req.businessFlags.varyingFlag = false;

            flags = businessFlag.getFlags(req);
            flags.varyingFlag.should.equal(false);
        });
    });

    describe('#isEnabled', () => {
        it('should call getFlags to fetch the current flags from the req', () => {
            businessFlag.isEnabled('enabledFlag', req).should.be.true;
        });

        it('should be true with an enabled flag', () => {
            businessFlag.isEnabled('enabledFlag', req).should.be.true;
        });

        it('should be false with an disabled flag', () => {
            businessFlag.isEnabled('disabledFlag', req).should.be.false;
        });

        it('should be false with a non existing flag', () => {
            businessFlag.isEnabled('nonExistingFlag', req).should.be.false;
        });
    });

    describe('#isDisabled', () => {
        it('should be false with an enabled flag', () => {
            businessFlag.isDisabled('enabledFlag', req).should.be.false;
        });

        it('should be true with an disabled flag', () => {
            businessFlag.isDisabled('disabledFlag', req).should.be.true;
        });

        it('should be true with an non existing flag', () => {
            businessFlag.isDisabled('nonExistingFlag', req).should.be.true;
        });
    });

    describe('#redirectIfEnabled', () => {
        it('should redirect with an enabled flag', () => {
            middleware = businessFlag.redirectIfEnabled('enabledFlag', 'http://example.org');
            middleware(req, res, next);
            res.redirect.should.have.been.calledWith('http://example.org');
        });

        it('should not call next with an enabled flag', () => {
            middleware = businessFlag.redirectIfEnabled('enabledFlag', 'http://example.org');
            middleware(req, res, next);
            next.should.not.have.been.called;
        });

        it('should not redirect with a disabled flag', () => {
            middleware = businessFlag.redirectIfEnabled('disabledFlag', 'http://example.org');
            middleware(req, res, next);
            res.redirect.should.not.have.been.called;
        });

        it('should call next with a disabled flag', () => {
            middleware = businessFlag.redirectIfEnabled('disabledFlag', 'http://example.org');
            middleware(req, res, next);
            next.should.have.been.called;
        });

        it('should not redirect with a non existing flag', () => {
            middleware = businessFlag.redirectIfEnabled('nonExistingFlag', 'http://example.org');
            middleware(req, res, next);
            res.redirect.should.not.have.been.called;
        });

        it('should call next with a non existing flag', () => {
            middleware = businessFlag.redirectIfEnabled('nonExistingFlag', 'http://example.org');
            middleware(req, res, next);
            next.should.have.been.called;
        });
    });

    describe('#redirectIfDisabled', () => {
        it('should not redirect with an enabled flag', () => {
            middleware = businessFlag.redirectIfDisabled('enabledFlag', 'http://example.org');
            middleware(req, res, next);
            res.redirect.should.not.have.been.called;
        });

        it('should call next with an enabled flag', () => {
            middleware = businessFlag.redirectIfDisabled('enabledFlag', 'http://example.org');
            middleware(req, res, next);
            next.should.have.been.called;
        });

        it('should redirect with a disabled flag', () => {
            middleware = businessFlag.redirectIfDisabled('disabledFlag', 'http://example.org');
            middleware(req, res, next);
            res.redirect.should.have.been.calledWith('http://example.org');
        });

        it('should not call next with a disabled flag', () => {
            middleware = businessFlag.redirectIfDisabled('disabledFlag', 'http://example.org');
            middleware(req, res, next);
            next.should.not.have.been.called;
        });

        it('should redirect with a non existing flag', () => {
            middleware = businessFlag.redirectIfDisabled('nonExistingFlag', 'http://example.org');
            middleware(req, res, next);
            res.redirect.should.have.been.called;
        });

        it('should not call next with a non existing flag', () => {
            middleware = businessFlag.redirectIfDisabled('nonExistingFlag', 'http://example.org');
            middleware(req, res, next);

            next.should.not.have.been.called;
        });
    });

    describe('#routeIfEnabled', () => {
        let ifMiddleware, elseMiddleware;

        beforeEach(() => {
            ifMiddleware = sinon.stub();
            elseMiddleware = sinon.stub();
        });

        it('should route to ifMiddleware with an enabled flag', () => {
            middleware = businessFlag.routeIf('enabledFlag', ifMiddleware, elseMiddleware);

            middleware(req, res, next);

            ifMiddleware.should.have.been.calledWithExactly(req, res, next);
            elseMiddleware.should.not.have.been.called;
        });

        it('should route to elseMiddleware with a disabled flag', () => {
            middleware = businessFlag.routeIf('disabledFlag', ifMiddleware, elseMiddleware);

            middleware(req, res, next);

            elseMiddleware.should.have.been.calledWithExactly(req, res, next);
            ifMiddleware.should.not.have.been.called;
        });

        it('should route to elseMiddleware with a non existing flag', () => {
            middleware = businessFlag.routeIf('nonExistingFlag', ifMiddleware, elseMiddleware);

            middleware(req, res, next);

            elseMiddleware.should.have.been.calledWithExactly(req, res, next);
            ifMiddleware.should.not.have.been.called;
        });

        it('should route to elseMiddleware with a no flag', () => {
            middleware = businessFlag.routeIf(undefined, ifMiddleware, elseMiddleware);

            middleware(req, res, next);

            elseMiddleware.should.have.been.calledWithExactly(req, res, next);
            ifMiddleware.should.not.have.been.called;
        });
    });
});
