/// <reference path="../typings/tsd.d.ts"/>
var url = require('url');
var os = require('os');
var crypto = require('crypto');
var fs = require('fs');
var Q = require('q');
var request = require('request');
var mkdirp = require('mkdirp');
var AirMedia = (function () {
    function AirMedia(_appId, _appName, _appVersion) {
        this._appId = _appId;
        this._appName = _appName;
        this._appVersion = _appVersion;
    }
    Object.defineProperty(AirMedia.prototype, "appId", {
        get: function () {
            return this._appId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AirMedia.prototype, "appName", {
        get: function () {
            return this._appName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AirMedia.prototype, "appVersion", {
        get: function () {
            return this._appVersion;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AirMedia.prototype, "baseUrl", {
        get: function () {
            return this._baseUrl;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AirMedia.prototype, "appTokenFile", {
        get: function () {
            return AirMedia.tokensDir + this._appId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AirMedia.prototype, "appToken", {
        get: function () {
            return this._appToken;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AirMedia.prototype, "trackId", {
        get: function () {
            return this._trackId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AirMedia.prototype, "challenge", {
        get: function () {
            return this._challenge;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AirMedia.prototype, "sessionToken", {
        get: function () {
            return this._sessionToken;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(AirMedia.prototype, "permissions", {
        get: function () {
            return this._permissions;
        },
        enumerable: true,
        configurable: true
    });
    AirMedia.prototype.openSession = function () {
        var _this = this;
        return this.discover().then(function () {
            return Q.nfcall(fs.readFile, _this.appTokenFile);
        }).then(function (data) {
            _this._appToken = data;
            return _this.getChallenge();
        }).catch(function () {
            return _this.authorize().then(function () {
                return _this.trackAuthorization();
            });
        }).then(function () {
            var hmac = crypto.createHmac('sha1', _this._appToken).update(_this._challenge);
            return Q.nfcall(request.post, _this._baseUrl + 'login/session/', {
                json: true,
                body: {
                    app_id: _this._appId,
                    password: hmac.digest('hex')
                }
            });
        }).spread(this.getResult).then(function (result) {
            _this._sessionToken = result.session_token;
            _this._permissions = result.permissions;
            return _this;
        });
    };
    AirMedia.prototype.closeSession = function () {
        var _this = this;
        return Q.nfcall(request.post, this._baseUrl + 'login/logout/', {
            json: true,
            headers: {
                'X-Fbx-App-Auth': this._sessionToken
            }
        }).spread(this.getResult).then(function () {
            _this._sessionToken = undefined;
            _this._permissions = undefined;
            return _this;
        });
    };
    AirMedia.prototype.discover = function () {
        var _this = this;
        return Q.nfcall(request.get, url.resolve(AirMedia.freeboxHost, 'api_version'), { json: true }).spread(function (response, body) {
            if (response.statusCode != 200) {
                throw new Error(response.statusMessage);
            }
            _this._baseUrl = url.resolve(AirMedia.freeboxHost, body.api_base_url + 'v' + body.api_version.split('.')[0] + '/');
            return _this;
        });
    };
    AirMedia.prototype.authorize = function () {
        var _this = this;
        return Q.nfcall(request.post, this._baseUrl + 'login/authorize/', {
            json: true,
            body: {
                app_id: this._appId,
                app_name: this._appName,
                app_version: this._appVersion,
                device_name: os.hostname()
            }
        }).spread(this.getResult).then(function (result) {
            _this._appToken = result.app_token;
            _this._trackId = result.track_id;
            return Q.nfcall(mkdirp, AirMedia.tokensDir);
        }).then(function () {
            return Q.nfcall(fs.writeFile, _this.appTokenFile, _this._appToken);
        }).then(function () {
            return _this;
        });
    };
    AirMedia.prototype.trackAuthorization = function () {
        var _this = this;
        return Q.nfcall(request.get, this._baseUrl + 'login/authorize/' + this._trackId, { json: true }).spread(this.getResult).then(function (result) {
            _this._challenge = result.challenge;
            switch (result.status) {
                case 'pending':
                    return Q.delay(1000).then(function () {
                        return _this.trackAuthorization();
                    });
                case 'granted':
                    return _this;
                default:
                    throw new Error('Authorization token status: ' + result.status);
            }
        });
    };
    AirMedia.prototype.getChallenge = function () {
        var _this = this;
        return Q.nfcall(request.get, this._baseUrl + 'login/', { json: true }).spread(this.getResult).then(function (result) {
            _this._challenge = result.challenge;
            return _this;
        });
    };
    AirMedia.prototype.getResult = function (response, body) {
        if (response.statusCode == 200 && body.success) {
            return body.result;
        }
        else {
            throw new Error(body.msg || response.statusMessage);
        }
    };
    AirMedia.freeboxHost = 'http://mafreebox.freebox.fr';
    AirMedia.tokensDir = 'tokens/';
    return AirMedia;
})();
module.exports = AirMedia;
