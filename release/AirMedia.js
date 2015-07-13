/// <reference path="../typings/tsd.d.ts"/>
var url = require('url');
var os = require('os');
var Q = require('q');
var request = require('request');
var AirMedia = (function () {
    function AirMedia() {
    }
    Object.defineProperty(AirMedia.prototype, "baseUrl", {
        get: function () {
            return this._baseUrl;
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
                app_id: "fr.freebox.airmedia.test",
                app_name: "AirMedia Test",
                app_version: "0.0.1",
                device_name: os.hostname()
            }
        }).spread(function (response, body) {
            if (response.statusCode != 200) {
                throw new Error(response.statusMessage);
            }
            if (body.success) {
                _this._appToken = body.result.app_token;
                _this._trackId = body.result.track_id;
                return _this;
            }
            else {
                throw new Error(body.msg);
            }
        });
    };
    AirMedia.freeboxHost = 'http://mafreebox.freebox.fr';
    return AirMedia;
})();
module.exports = AirMedia;
