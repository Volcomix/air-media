/// <reference path="../typings/tsd.d.ts"/>
var url = require('url');
var os = require('os');
var crypto = require('crypto');
var fs = require('fs');
var Q = require('q');
var request = require('request');
var mkdirp = require('mkdirp');
var Login = (function () {
    function Login(_appId, _appName, _appVersion) {
        this._appId = _appId;
        this._appName = _appName;
        this._appVersion = _appVersion;
    }
    Object.defineProperty(Login.prototype, "appId", {
        get: function () {
            return this._appId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Login.prototype, "appName", {
        get: function () {
            return this._appName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Login.prototype, "appVersion", {
        get: function () {
            return this._appVersion;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Login.prototype, "baseUrl", {
        get: function () {
            return this._baseUrl;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Login.prototype, "appTokenFile", {
        get: function () {
            return Login.tokensDir + this._appId;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Login.prototype, "sessionToken", {
        get: function () {
            return this._sessionToken;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Login.prototype, "permissions", {
        get: function () {
            return this._permissions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Login.prototype, "headers", {
        get: function () {
            return {
                'X-Fbx-App-Auth': this._sessionToken
            };
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Login.prototype, "requestOptions", {
        get: function () {
            return {
                json: true,
                headers: this.headers
            };
        },
        enumerable: true,
        configurable: true
    });
    Login.prototype.openSession = function (password, algorithm) {
        var _this = this;
        if (algorithm === void 0) { algorithm = 'aes192'; }
        return this.discover().then(function () {
            return Q.nfcall(fs.readFile, _this.appTokenFile, { encoding: 'binary' });
        }).then(function (data) {
            var decipher = crypto.createDecipher(algorithm, password);
            _this._appToken = decipher.update(data, 'binary', 'utf8');
            _this._appToken += decipher.final('utf8');
            return _this.getChallenge();
        }).catch(function (error) {
            return _this.authorize(password, algorithm).then(function () {
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
    Login.prototype.closeSession = function () {
        var _this = this;
        return Q.nfcall(request.post, this._baseUrl + 'login/logout/', this.requestOptions).spread(this.getResult).then(function () {
            _this._sessionToken = undefined;
            _this._permissions = undefined;
            return _this;
        });
    };
    Login.prototype.getResult = function (response, body) {
        if (response.statusCode == 200 && body.success) {
            return body.result;
        }
        else {
            throw new Error(body.msg || response.statusMessage);
        }
    };
    Login.prototype.discover = function () {
        var _this = this;
        return Q.nfcall(request.get, url.resolve(Login.freeboxHost, 'api_version'), { json: true }).spread(function (response, body) {
            if (response.statusCode != 200) {
                throw new Error(response.statusMessage);
            }
            _this._baseUrl = url.resolve(Login.freeboxHost, body.api_base_url + 'v' + body.api_version.split('.')[0] + '/');
            return _this;
        });
    };
    Login.prototype.authorize = function (password, algorithm) {
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
            return Q.nfcall(mkdirp, Login.tokensDir);
        }).then(function () {
            var cipher = crypto.createCipher(algorithm, password);
            var data = cipher.update(_this._appToken, 'utf8', 'binary');
            data += cipher.final('binary');
            return Q.nfcall(fs.writeFile, _this.appTokenFile, data, { encoding: 'binary' });
        }).then(function () {
            return _this;
        });
    };
    Login.prototype.trackAuthorization = function () {
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
    Login.prototype.getChallenge = function () {
        var _this = this;
        return Q.nfcall(request.get, this._baseUrl + 'login/', { json: true }).spread(this.getResult).then(function (result) {
            _this._challenge = result.challenge;
            return _this;
        });
    };
    Login.freeboxHost = 'http://mafreebox.freebox.fr';
    Login.tokensDir = 'tokens/';
    return Login;
})();
module.exports = Login;
