/// <reference path="../typings/tsd.d.ts"/>

import url = require('url');
import http = require('http');
import os = require('os');

import Q = require('q');
import request = require('request');

class AirMedia {

    private static freeboxHost = 'http://mafreebox.freebox.fr';

    private _baseUrl: string;
    private _appToken: string;
    private _trackId: number;
    private _challenge: string;
    
    get baseUrl(): string {
        return this._baseUrl;
    }
    
    get appToken(): string {
        return this._appToken;
    }
    
    get trackId(): number {
        return this._trackId;
    }
    
    get challenge(): string {
        return this._challenge;
    }

    discover(): Q.Promise<AirMedia> {
        return Q.nfcall(
            request.get, url.resolve(AirMedia.freeboxHost, 'api_version'), { json: true }
        ).spread<AirMedia>((response: http.IncomingMessage, body: any) => {
            if (response.statusCode != 200) {
                throw new Error(response.statusMessage);
            }
            this._baseUrl = url.resolve(
                AirMedia.freeboxHost,
                body.api_base_url + 'v' + body.api_version.split('.')[0] + '/'
            );
            return this;
        });
    }
    
    authorize(): Q.Promise<AirMedia> {
        return Q.nfcall(request.post, this._baseUrl + 'login/authorize/', {
            json: true,
            body: {
                app_id: "fr.freebox.airmedia.test",
                app_name: "AirMedia Test",
                app_version: "0.0.1",
                device_name: os.hostname()
            }
        })
        .spread<AirMedia>((response: http.IncomingMessage, body: any) => {
            if (response.statusCode != 200) {
                throw new Error(response.statusMessage);
            }
            if (body.success) {
                this._appToken = body.result.app_token;
                this._trackId = body.result.track_id;
                return this;
            } else {
                throw new Error(body.msg);
            }
        });
    }
}

export = AirMedia;