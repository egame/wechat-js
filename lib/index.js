/**
 * Created by vt on 15/1/21.
 */
var Store = require('./store');
var Signature = require('./signature');

var WeChat = function (appId, secret, redisConn) {
    var store;
    if (redisConn) {
        store = Store.create('redis', redisConn);
    } else {
        store = Store.create('memory');
    }
    this._signature = new Signature(appId, secret, store);
};

WeChat.prototype.sign = function (url, next) {
    this._signature.sign(url, next);
};

module.exports = WeChat;