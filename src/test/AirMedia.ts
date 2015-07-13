/// <reference path="../../typings/tsd.d.ts"/>

import http = require('http');

import chai = require('chai');

import AirMedia = require('../AirMedia');

var should = chai.should();

describe('AirMedia', function() {
    var airMedia: AirMedia;
    before(function() {
        airMedia = new AirMedia();
    });
    describe('#discover()', function() {
        it('should return API base URL', function() {
            return airMedia.discover()
            .then(function(airMedia) {
                airMedia.baseUrl.should.be.equal('http://mafreebox.freebox.fr/api/v3/');
            });
        });
    });
    describe('#authorize()', function() {
        it('should return app token and track id', function() {
            return airMedia.authorize()
            .then(function(airMedia) {
                should.exist(airMedia.appToken);
                airMedia.trackId.should.be.a('number');
            });
        });
    });
});