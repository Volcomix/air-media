/// <reference path="../typings/tsd.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Q = require('q');
var request = require('request');
var Login = require('./Login');
var AirMedia = (function (_super) {
    __extends(AirMedia, _super);
    function AirMedia() {
        _super.apply(this, arguments);
    }
    AirMedia.prototype.getReceivers = function () {
        return Q.nfcall(request.get, this.baseUrl + 'airmedia/receivers/', this.requestOptions).spread(this.getResult);
    };
    AirMedia.prototype.startVideo = function (url) {
        var _this = this;
        return Q.nfcall(request.post, this.baseUrl + 'airmedia/receivers/Freebox%20Player/', {
            json: true,
            headers: this.headers,
            body: {
                action: 'start',
                media_type: 'video',
                media: url
            }
        }).spread(this.getResult).then(function () {
            return _this;
        });
    };
    AirMedia.prototype.stopVideo = function () {
        var _this = this;
        return Q.nfcall(request.post, this.baseUrl + 'airmedia/receivers/Freebox%20Player/', {
            json: true,
            headers: this.headers,
            body: {
                action: 'stop',
                media_type: 'video'
            }
        }).spread(this.getResult).then(function () {
            return _this;
        });
    };
    return AirMedia;
})(Login);
module.exports = AirMedia;
