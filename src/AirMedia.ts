/// <reference path="../typings/tsd.d.ts"/>

import Q = require('q');
import request = require('request');

import Login = require('./Login');

class AirMedia extends Login {
	getReceivers(): Q.Promise<AirMedia.Receivers> {
		return Q.nfcall(
			request.get, this.baseUrl + 'airmedia/receivers/', this.requestOptions
		)
		.spread<AirMedia.Receivers>(this.getResult);
	}
	
	startVideo(url: string): Q.Promise<AirMedia> {
		return Q.nfcall(
			request.post,
			this.baseUrl + 'airmedia/receivers/Freebox%20Player/',
			{
				json: true,
				headers: this.headers,
				body: {
					action: 'start',
					media_type: 'video',
					media: url
				}
			}
		)
		.spread(this.getResult)
		.then(() => {
			return this;
		});
	}
	
	stopVideo() {
		return Q.nfcall(
			request.post,
			this.baseUrl + 'airmedia/receivers/Freebox%20Player/',
			{
				json: true,
				headers: this.headers,
				body: {
					action: 'stop',
					media_type: 'video'
				}
			}
		)
		.spread(this.getResult)
		.then(() => {
			return this;
		});
	}
}

module AirMedia {
	export interface Receivers {
		[index: number]: {
			name: string;
			capabilities: {
				photo: boolean;
				audio: boolean;
				video: boolean;
				screen: boolean;
			};
			passwordProtected: boolean;
		}
	}
}

export = AirMedia;