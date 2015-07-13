/// <reference path="../typings/tsd.d.ts"/>

import url = require('url');
import http = require('http');
import os = require('os');
import crypto = require('crypto');
import fs = require('fs');

import Q = require('q');
import request = require('request');
import mkdirp = require('mkdirp');

class Login {

    private static freeboxHost = 'http://mafreebox.freebox.fr';
    private static tokensDir = 'tokens/';

    private _baseUrl: string;
    private _appToken: string;
    private _trackId: number;
    private _challenge: string;
    private _sessionToken: string;
    private _permissions: any;
    
    get appId(): string {
        return this._appId;
    }
    
    get appName(): string {
        return this._appName;
    }
    
    get appVersion(): string {
        return this._appVersion;
    }
    
    get baseUrl(): string {
        return this._baseUrl;
    }
    
    get appTokenFile(): string {
        return Login.tokensDir + this._appId;
    }
    
    get sessionToken(): string {
        return this._sessionToken;
    }
    
    get permissions(): any {
        return this._permissions;
    }
    
    constructor(
        private _appId: string,
        private _appName: string,
        private _appVersion: string
    ) { }
    
    openSession(password: string, algorithm = 'aes192'): Q.Promise<Login> {
        return this.discover()
        .then(() => {
            return Q.nfcall(fs.readFile, this.appTokenFile, { encoding: 'binary' });
        })
        .then((data: string) => {
            var decipher = crypto.createDecipher(algorithm, password);
            this._appToken = decipher.update(data, 'binary', 'utf8');
            this._appToken += decipher.final('utf8');
            return this.getChallenge();
        })
        .catch((error) => {
            return this.authorize(password, algorithm)
            .then(() => {
                return this.trackAuthorization();
            })
        })
        .then(() => {
            var hmac = crypto.createHmac('sha1', this._appToken).update(this._challenge);
            return Q.nfcall(request.post, this._baseUrl + 'login/session/', {
                json: true,
                body: {
                    app_id: this._appId,
                    password: hmac.digest('hex')
                }
            })
        })
        .spread<any>(this.getResult)
        .then((result) => {
            this._sessionToken = result.session_token;
            this._permissions = result.permissions;
            return this;
        });
    }
    
    closeSession(): Q.Promise<Login> {
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

    private discover(): Q.Promise<Login> {
        return Q.nfcall(
            request.get, url.resolve(Login.freeboxHost, 'api_version'), { json: true }
        )
        .spread<Login>((response: http.IncomingMessage, body: any) => {
            if (response.statusCode != 200) {
                throw new Error(response.statusMessage);
            }
            this._baseUrl = url.resolve(
                Login.freeboxHost,
                body.api_base_url + 'v' + body.api_version.split('.')[0] + '/'
            );
            return this;
        });
    }
    
    private authorize(password: string, algorithm: string): Q.Promise<Login> {
        return Q.nfcall(request.post, this._baseUrl + 'login/authorize/', {
            json: true,
            body: {
                app_id: this._appId,
                app_name: this._appName,
                app_version: this._appVersion,
                device_name: os.hostname()
            }
        })
        .spread<any>(this.getResult)
        .then((result) => {
            this._appToken = result.app_token;
            this._trackId = result.track_id;
            return Q.nfcall(mkdirp, Login.tokensDir);
        })
        .then(() => {
            var cipher = crypto.createCipher(algorithm, password);
            var data = cipher.update(this._appToken, 'utf8', 'binary');
            data += cipher.final('binary');
            return Q.nfcall(fs.writeFile, this.appTokenFile, data, { encoding: 'binary' });
        })
        .then(() => {
            return this;
        });
    }
    
    private trackAuthorization(): Q.Promise<Login> {
        return Q.nfcall(
            request.get, this._baseUrl + 'login/authorize/' + this._trackId, { json:true }
        )
        .spread<any>(this.getResult)
        .then((result) => {
            this._challenge = result.challenge;
            switch (result.status) {
                case 'pending':
                    return Q.delay(1000).then<Login>(() => {
                        return this.trackAuthorization();
                    });
                case 'granted':
                    return this;
                default:
                    throw new Error('Authorization token status: ' + result.status);
            }
        });
    }
    
    private getChallenge(): Q.Promise<Login> {
        return Q.nfcall(request.get, this._baseUrl + 'login/', { json: true })
        .spread<any>(this.getResult)
        .then((result) => {
            this._challenge = result.challenge;
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

export = Login;