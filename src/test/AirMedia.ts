/// <reference path="../../typings/tsd.d.ts"/>

import chai = require('chai');
import Q = require('q');

import AirMedia = require('../AirMedia');

var should = chai.should();

describe.only('AirMedia', function() {
	var airMedia: AirMedia;
	before(function() {
		airMedia = new AirMedia(
	        "air-media.AirMedia.test",
	        "air-media AirMedia Test",
	        "0.0.1"
	    )
		return airMedia.openSession('P@$$w0rd');
	});
	describe('#getReceivers()', function() {
		var receivers: AirMedia.Receivers;
		before(function() {
			return airMedia.getReceivers()
			.then(function(result) {
				receivers = result;
			});
		});
		it('should get Freebox Server', function() {
			receivers.should.have.property('0')
			.which.have.property('name').equal('Freebox Server');
		});
		it('should get FreeboxPlayer', function() {
			receivers.should.have.property('1')
			.which.have.property('name').equal('Freebox Player');
		});
	});
	describe('#startVideo()', function() {
		it('should succeed', function() {
			return airMedia.startVideo(
				'http://anon.nasa-global.edgesuite.net/HD_downloads/GRAIL_launch_480.mov'
			)
			.then(function() {
				return Q.delay(20000);
			});
		});
	});
	describe('#stopVideo()', function() {
		it('should succeed', function() {
			return airMedia.stopVideo();
		});
	});
	after(function() {
		return airMedia.closeSession();
	});
});