/// <reference path="../typings/tsd.d.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Login = require('./Login');
var AirMedia = (function (_super) {
    __extends(AirMedia, _super);
    function AirMedia() {
        _super.apply(this, arguments);
    }
    return AirMedia;
})(Login);
module.exports = AirMedia;
