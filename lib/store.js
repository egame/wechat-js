/**
 * Created by vt on 15/1/21.
 */

var util = require('util');


var MemStore = function () {
    this._store = {};
};

// 将值放入内存仓储并设置过期
MemStore.prototype.set = function (key, value, expire, next) {
    this._store[key] = {
        value: value,
        expireIn: expire ? parseInt(Date.now() / 1000, 10) + expire : null
    };
    next && next();
};

// 从内存仓储取值
MemStore.prototype.get = function (key, next) {
    if (!this._store.hasOwnProperty(key)) return next(null);
    var v = this._store[key];
    if (v.expireIn && v.expireIn > parseInt(Date.now() / 1000, 10)) {
        return next(v.value);
    }
    next(null);
};

var RedisStore = function (redisConn) {
    this._conn = redisConn;
};

var redisKeyPrefix = 'wechat:store:';
// 在 redis 中设置 VALUE 并设置过期
RedisStore.prototype.set = function (key, value, expire, next) {
    next = next || function () {
    };
    if (expire) {
        return this._conn.SETEX(redisKeyPrefix + key, expire, value, next)
    }
    this._conn.SET(redisKeyPrefix + key, value, next);
};

RedisStore.prototype.get = function (key, next) {
    this._conn.GET(redisKeyPrefix + key, function (err, reply) {
        if (err) {
            throw Error(err);
        }
        next && next(reply);
    })
};

module.exports = {
    create: function (type, conn) {
        switch (type) {
            case 'redis':
                return new RedisStore(conn);
            case 'memory':
                return new MemStore();
                throw Error(util.format('store: %s can not be found.', type));
        }
    }
};