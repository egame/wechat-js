## 微信 javascript API 服务器端支持

 -- nodejs version

#### 当前功能

1. 生成需要的加密内容
2. 支持基于内存以及 redis 的 token 以及 ticket 缓存
3. 基本的错误处理

#### 快速使用

1. `npm install wechat-js`

		var WeChat = require('wechat-js');
		var weChat = new WeChat(APP_ID, APP_SECRET[, redisConn]);
		console.log(weChat.sign(url))
		
如果使用 redis 作为缓存的话，需要在这里写入 redisConn，即 `redis.createClient()` 后返回的对象。

####开发模式

1. `git clone https://github.com/egame/wechat-js`
2. `source tests/env.sh`
3. `npm test`

#### TODO

1. 用户相关的网页能力

#### 开源协议

MIT