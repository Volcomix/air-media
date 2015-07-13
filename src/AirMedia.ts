/// <reference path="../typings/tsd.d.ts"/>

import url = require('url');
import http = require('http');
import os = require('os');
import crypto = require('crypto');

import Q = require('q');
import request = require('request');

class AirMedia {

    private static freeboxHost = 'http://mafreebox.freebox.fr';

    private _baseUrl: string;
    private _appToken: string;
    private _trackId: number;
    private _challenge: string;
    private _sessionToken: string;
    private _permissions: any;
    
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
    
    get sessionToken(): string {
        return this._sessionToken;
    }
    
    get permissions(): any {
        return this._permissions;
    }
    
    constructor(private appId: string, private appName: string, private appVersion: string) {
        
    }

    discover(): Q.Promise<AirMedia> {
        return Q.nfcall(
            request.get, url.resolve(AirMedia.freeboxHost, 'api_version'), { json: true }
        )
        .spread<AirMedia>((response: http.IncomingMessage, body: any) => {
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
                app_id: this.appId,
                app_name: this.appName,
                app_version: this.appVersion,
                device_name: os.hostname()
            }
        })
        .spread<any>(this.getResult)
        .then((result) => {
            this._appToken = result.app_token;
            this._trackId = result.track_id;
            return this;
        });
    }
    
    trackAuthorization(): Q.Promise<AirMedia> {
        return Q.nfcall(
            request.get, this._baseUrl + 'login/authorize/' + this._trackId, { json:true }
        )
        .spread<any>(this.getResult)
        .then((result) => {
            this._challenge = result.challenge;
            switch (result.status) {
                case 'pending':
                    return Q.delay(1000).then<AirMedia>(this.trackAuthorization.bind(this));
                case 'granted':
                    return this;
                default:
                    throw new Error('Authorization token status: ' + result.status);
            }
        });
    }
    
    openSession(): Q.Promise<AirMedia> {
        var hmac = crypto.createHmac('sha1', this._appToken).update(this._challenge);
        return Q.nfcall(request.post, this._baseUrl + 'login/session/', {
            json: true,
            body: {
                app_id: this.appId,
                password: hmac.digest('hex')
            }
        })
        .spread<any>(this.getResult)
        .then((result) => {
            this._sessionToken = result.session_token;
            this._permissions = result.permissions;
            return this;
        });
    }
    
    closeSession(): Q.Promise<AirMedia> {
        return Q.nfcall(request.post, this._baseUrl + 'login/logout/', {
            json: true,
            headers: {
                'X-Fbx-App-Auth': this._sessionToken
            }
        })
        .spread(this.getResult)
        .then(() => {
            this._sessionToken = undefined;
            this._permissions = undefined;
            return this;
        });
    }
    
    private getResult(response: http.IncomingMessage, body: any): any {
        if (response.statusCode == 200 && body.success) {
            return body.result;
        } else {
            throw new Error(body.msg || response.statusMessage);
        }
    }
}

export = AirMedia;