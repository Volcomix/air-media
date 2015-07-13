/// <reference path="../../typings/tsd.d.ts"/>
var chai = require('chai');
var AirMedia = require('../AirMedia');
var should = chai.should();
describe('AirMedia', function () {
    var airMedia;
    before(function () {
        airMedia = new AirMedia();
    });
    describe('#discover()', function () {
        it('should return API base URL', function () {
            return airMedia.discover().then(function (airMedia) {
                airMedia.baseUrl.should.be.equal('http://mafreebox.freebox.fr/api/v3/');
            });
        });
    });
    describe('#authorize()', function () {
        it('should return app token and track id', function () {
            return airMedia.authorize().then(function (airMedia) {
                should.exist(airMedia.appToken);
                airMedia.trackId.should.be.a('number');
            });
        });
    });
});
