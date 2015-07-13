/// <reference path="../../typings/tsd.d.ts"/>
var fs = require('fs');
var chai = require('chai');
var Q = require('q');
var AirMedia = require('../AirMedia');
var should = chai.should();
describe('AirMedia', function () {
    context('when first login', function () {
        var airMedia;
        before(function () {
            airMedia = new AirMedia("fr.freebox.airmedia.test", "AirMedia Test", "0.0.1");
        });
        describe('#openSession()', function () {
            it('should ask for authorization on Freebox LCD', function () {
                return airMedia.openSession('P@$$w0rd');
            });
            it('should get session token', function () {
                should.exist(airMedia.sessionToken);
            });
            it('should get permissions', function () {
                should.exist(airMedia.permissions);
            });
        });
        describe('#closeSession()', function () {
            it('should succeed', function () {
                return airMedia.closeSession();
            });
            it('should not have session token', function () {
                should.not.exist(airMedia.sessionToken);
            });
            it('should not have permissions', function () {
                should.not.exist(airMedia.permissions);
            });
        });
    });
    context('when second login', function () {
        var airMedia;
        before(function () {
            airMedia = new AirMedia("fr.freebox.airmedia.test", "AirMedia Test", "0.0.1");
        });
        describe('#openSession()', function () {
            it('should not ask for authorization on Freebox LCD', function () {
                return airMedia.openSession('P@$$w0rd');
            });
            it('should get session token', function () {
                should.exist(airMedia.sessionToken);
            });
            it('should get permissions', function () {
                should.exist(airMedia.permissions);
            });
        });
        describe('#closeSession()', function () {
            it('should succeed', function () {
                return airMedia.closeSession();
            });
            it('should not have session token', function () {
                should.not.exist(airMedia.sessionToken);
            });
            it('should not have permissions', function () {
                should.not.exist(airMedia.permissions);
            });
        });
    });
    after(function () {
        return Q.nfcall(fs.unlink, 'tokens/fr.freebox.airmedia.test').done();
    });
});
