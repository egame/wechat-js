/**
 * Created by vt on 15/1/21.
 */

var request = require('request');
var sha = require('jssha');

var Signature = function (appId, secret, store) {
    this._store = store;
    this._auth = {
        id: appId,
        secret: secret
    }
};

Signature.createNonceStr = function () {
    return Math.random().toString(36).substr(2, 15);
};

Signature.createTimestamp = function () {
    return String(parseInt(new Date().getTime() / 1000, 10));
};

Signature.prototype.getToken = function (next, force) {
    var self = this;
    if (!force) {
        return self._store.get('token', function (token) {
            if (!token) {
                return self.getToken(next, true);
            }
            next(token);
        });
    }
    request.get('https://api.weixin.qq.com/cgi-bin/token', {
        qs: {
            grant_type: "client_credential",
            appid: self._auth.id,
            secret: self._auth.secret
        }
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var res = JSON.parse(body);
            // 抛出微信服务端异常
            if (res.errcode > 0) {
                throw Error(res.errmsg);
            }
            self._store.set('token', res.access_token, res.expires_in, function () {
                next(res.access_token);
            });
        } else {
            // 报错则重新获取
            setTimeout(function () {
                self.getToken(next, true);
            }, 1000);
        }
    });
};

Signature.prototype.getTicket = function (next, force) {
    var self = this;
    if (!force) {
        return self._store.get('ticket', function (ticket) {
            if (!ticket) {
                return self.getTicket(next, true);
            }
            next(ticket);
        });
    }
    self.getToken(function (token) {
        request.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket', {
            qs: {
                access_token: token,
                type: 'jsapi'
            }
        }, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                var res = JSON.parse(body);
                if (res.errcode === 40001) {
                    return self.getToken(function () {
                        self.getTicket(next, true)
                    }, true);
                }
                // 抛出微信服务端异常
                if (res.errcode > 0) {
                    throw Error(res.errmsg);
                }
                self._store.set('ticket', res.ticket, res.expires_in, function () {
                    next(res.ticket);
                });
            } else {
                // 报错则重新获取
                setTimeout(function () {
                    self.getTicket(next, true);
                }, 1000);
            }
        });
    });
};

Signature.raw = function (args) {
    var keys = Object.keys(args);
    keys = keys.sort();
    var newArgs = {};
    keys.forEach(function (key) {
        newArgs[key.toLowerCase()] = args[key];
    });
    var string = '';
    for (var k in newArgs) {
        if (newArgs.hasOwnProperty(k)) {
            string += '&' + k + '=' + newArgs[k];
        }
    }
    string = string.substr(1);
    return string;
};

Signature.prototype.sign = function (url, next) {
    var self = this;
    self.getTicket(function (ticket) {
        var ret = {
            jsapi_ticket: ticket,
            nonceStr: self.createNonceStr(),
            timestamp: self.createTimestamp(),
            url: url
        };
        var s = new sha(self.raw(ret), 'TEXT');
        ret.signature = s.getHash('SHA-1', 'HEX');
        ret.appId = self._auth.id;
        delete(ret['jsapi_ticket']);
        next(ret);
    });
};

module.exports = Signature;
