import got, { RequestError } from 'got';
import { HttpsProxyAgent, HttpProxyAgent } from 'hpagent';
import { CookieJar } from 'tough-cookie';

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

const fetch = got.extend({
  headers: {
    referer: 'https://bilibili.com/',
    'user-agent': 'Mozilla/5.0',
  },
  agent: {
    http: httpAgent,
    https: httpsAgent,
  },
  cookieJar,
});

export default fetch;
