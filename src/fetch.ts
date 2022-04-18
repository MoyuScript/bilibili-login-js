import got from 'got';
import { HttpsProxyAgent, HttpProxyAgent } from 'hpagent';
import { CookieJar } from 'tough-cookie';
import crypto from 'crypto';

// 代理配置

const proxyUrl =
  process.env.HTTPS_PROXY ||
  process.env.https_proxy ||
  process.env.HTTP_PROXY ||
  process.env.http_proxy ||
  process.env.ALL_PROXY ||
  process.env.all_proxy;

let httpAgent: HttpProxyAgent | undefined;
let httpsAgent: HttpsProxyAgent | undefined;

if (proxyUrl) {
  httpAgent = new HttpProxyAgent({
    proxy: proxyUrl,
  });

  httpsAgent = new HttpsProxyAgent({
    proxy: proxyUrl,
  });
}

// CookieJar

export const cookieJar = new CookieJar();

// 绕风控

cookieJar.setCookieSync(
  `buvid3=${crypto.randomUUID()}; Domain=.bilibili.com`,
  'https://www.bilibili.com/'
);

const fetch = got.extend({
  headers: {
    referer: 'https://www.bilibili.com/',
    'user-agent': 'Mozilla/5.0',
  },
  agent: {
    http: httpAgent,
    https: httpsAgent,
  },
  https: {
    rejectUnauthorized: false,
  },
  cookieJar,
});

export default fetch;
