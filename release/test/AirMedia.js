/// <reference path="../../typings/tsd.d.ts"/>
var chai = require('chai');
var AirMedia = require('../AirMedia');
var should = chai.should();
describe('AirMedia', function () {
    var airMedia;
    before(function () {
        airMedia = new AirMedia("fr.freebox.air-media.AirMedia.test", "air-media AirMedia Test", "0.0.1");
    });
    it('should do something');
});
