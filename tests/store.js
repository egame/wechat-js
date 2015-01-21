/**
 * Created by vt on 15/1/21.
 */

require('should');
var store = require('../lib/store');
var randStr = require('../lib/signature').createNonceStr;

var memStore = store.create('memory');

describe('memory store base', function () {
    var key = randStr(), value = randStr();
    it('should be get after set', function (done) {
        memStore.set(key, value, 1, function () {
            memStore.get(key, function (v) {
                v.should.equal(value);
                done();
            });
        });
    });
    it('should be null if not set', function (done) {
        memStore.get(key + '|', function (v) {
            (v === null).should.be.true;
            done();
        });
    });
    it('should be be null if expired', function (done) {
        memStore.set(key, value, 0.01, function () {
            setTimeout(function () {
                memStore.get(key, function (v) {
                    (v === null).should.be.true;
                    done();
                });
            }, 900);
        });
    });
});

