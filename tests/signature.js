/**
 * Created by vt on 15/1/21.
 */

require('should');

var Signature = require('../lib/signature');
var store = require('../lib/store');

var memStore = store.create('memory');
var signature = new Signature(process.env.weChatId, process.env.weChatSecret, memStore);

describe('get token from wechat', function () {
    it('should be the same before expire', function (done) {
        signature.getToken(function (token) {
            signature.getToken(function (t) {
                t.should.equal(token);
                done();
            });
        });
    });
    it('should be the different after force', function (done) {
        signature.getToken(function (token) {
            signature.getToken(function (t) {
                (t !== token).should.be.true;
                done();
            }, true);
        });
    });
});

describe('get ticket from wechat', function () {
    it('should be the same before expire', function (done) {
        signature.getTicket(function (token) {
            signature.getTicket(function (t) {
                t.should.equal(token);
                done();
            });
        });
    });
    // 使用 token 重新获取 ticket 后 ticket 不会发生变化
    it('should get new token and new ticket if token expired unexpected', function (done) {
        var fakeToken = Signature.createNonceStr();
        memStore.set('token', fakeToken, 7200, function () {
            signature.getToken(function (token) {
                token.should.equal(fakeToken);
                signature.getTicket(function () {
                    signature.getToken(function (t) {
                        (t !== token).should.be.true;
                        done();
                    });
                }, true);
            })
        })
    });
});