/**
 * Created by vt on 15/1/21.
 */

require('should');

var Signature = require('../lib/signature');
var store = require('../lib/store');

var memStore = store.create('memory');
var signature = new Signature(process.env.weChatId, process.env.weChatSecret, memStore);