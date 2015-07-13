/// <reference path="../../typings/tsd.d.ts"/>

import chai = require('chai');

import AirMedia = require('../AirMedia');

var should = chai.should();

describe('AirMedia', function() {
	var airMedia: AirMedia;
	before(function() {
		airMedia = new AirMedia(
	        "fr.freebox.air-media.AirMedia.test",
	        "air-media AirMedia Test",
	        "0.0.1"
	    );
	});
	it('should do something');
});