/// <reference path="../../typings/tsd.d.ts"/>
var fs = require('fs');
var chai = require('chai');
var Q = require('q');
var Login = require('../Login');
var should = chai.should();
describe('Login', function () {
    context('when first login', function () {
        var login;
        before(function () {
            login = new Login("air-media.Login.test", "air-media Login Test", "0.0.1");
        });
        describe('#openSession()', function () {
            it('should ask for authorization on Freebox LCD', function () {
                return login.openSession('P@$$w0rd');
            });
            it('should get session token', function () {
                should.exist(login.sessionToken);
            });
            it('should get permissions', function () {
                should.exist(login.permissions);
            });
        });
        describe('#closeSession()', function () {
            it('should succeed', function () {
                return login.closeSession();
            });
            it('should not have session token', function () {
                should.not.exist(login.sessionToken);
            });
            it('should not have permissions', function () {
                should.not.exist(login.permissions);
            });
        });
    });
    context('when second login', function () {
        var login;
        before(function () {
            login = new Login("air-media.Login.test", "air-media Login Test", "0.0.1");
        });
        describe('#openSession()', function () {
            it('should not ask for authorization on Freebox LCD', function () {
                return login.openSession('P@$$w0rd');
            });
            it('should get session token', function () {
                should.exist(login.sessionToken);
            });
            it('should get permissions', function () {
                should.exist(login.permissions);
            });
        });
        describe('#closeSession()', function () {
            it('should succeed', function () {
                return login.closeSession();
            });
            it('should not have session token', function () {
                should.not.exist(login.sessionToken);
            });
            it('should not have permissions', function () {
                should.not.exist(login.permissions);
            });
        });
    });
    after(function () {
        return Q.nfcall(fs.unlink, 'tokens/air-media.Login.test').done();
    });
});
