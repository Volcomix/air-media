/// <reference path="../../typings/tsd.d.ts"/>
var chai = require('chai');
var AirMedia = require('../AirMedia');
var should = chai.should();
describe('AirMedia', function () {
    var airMedia;
    before(function () {
        airMedia = new AirMedia("fr.freebox.airmedia.test", "AirMedia Test", "0.0.1");
    });
    describe('#discover()', function () {
        it('should get API base URL', function () {
            return airMedia.discover().then(function () {
                airMedia.baseUrl.should.be.equal('http://mafreebox.freebox.fr/api/v3/');
            });
        });
    });
    describe('#authorize()', function () {
        it('should get app token and track id', function () {
            return airMedia.authorize().then(function () {
                should.exist(airMedia.appToken);
            });
        });
        it('should get track id', function () {
            airMedia.trackId.should.be.a('number');
        });
    });
    describe('#trackAuthorization()', function () {
        it('should grant authorization', function () {
            return airMedia.trackAuthorization();
        });
    });
    describe('#openSession()', function () {
        it('should get session token', function () {
            return airMedia.openSession().then(function () {
                should.exist(airMedia.sessionToken);
            });
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
