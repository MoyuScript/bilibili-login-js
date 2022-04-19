# bilibili-login-js

b 站登录库。

目前已支持登录方式：

+ ✅二维码登录。
+ ✅账号密码登录。
+ ▶️短信验证码登录（开发中）。

## 二维码登录演示

![](./assets/example-qrcode-login.webp)

## 安装

```bash
$ pnpm add bilibili-login-js

# or

$ npm install -S bilibili-login-js
```

## 使用

```js
import login from 'bilibili-login-js';
import got from 'got';

// 返回的是 Cookie 字符串，里面包含认证凭据，后续可用于请求 B 站登录态 API。
// 其中 `bili_jct` 是 CSRF 字符串，在 POST 请求需要附上 `csrf` 或者 `csrf_token`。
const cookie = await login('qrcode');

const resp = await got('https://api.bilibili.com/x/web-interface/nav', {
  headers: {
    cookie
  }
}).json();

console.log(`欢迎，${resp.data.uname}！`);
```

## API

### `login(type?: 'qrcode' | 'password')`

登录。

`type` 取值：

+ `qrcode`: 二维码登录。
+ `password`: 账号密码登录。

如果不传入 `type`，将会提示用户选择登录方式。
