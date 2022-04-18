import fetch from './fetch.js';
import Koa from 'koa';
import koaBodyParser from 'koa-bodyparser';
import Router from '@koa/router';
import koaStatic from 'koa-static';
import path from 'path';
import http from 'http';
import open from 'open';
import terminalKit from 'terminal-kit';
import { AddressInfo } from 'net';
import { internalIpV4Sync } from 'internal-ip';

const terminal = terminalKit.terminal;

export async function waitForCaptcha(): Promise<any> {
  const app = new Koa();
  const server = http.createServer(app.callback());

  // 不保持连接，优化速度。
  server.keepAliveTimeout = 1;

  const router = new Router();

  app
    .use(
      koaBodyParser({
        enableTypes: ['json'],
      })
    )
    .use(router.middleware());

  const currentFileDir = path.dirname(import.meta.url.replace('file:///', ''));
  const staticPath = path.join(currentFileDir, '../static');
  return new Promise((resolve) => {
    router
      .get('/(.*)', koaStatic(staticPath))
      .post('/proxy', async (ctx) => {
        try {
          const resp = await fetch({
            ...ctx.request.body,
          });
          ctx.body = {
            status: resp.statusCode,
            data: resp.body,
            headers: resp.headers,
          };
        } catch (err) {
          console.error(err);
          ctx.body = {
            status: 500,
          };
        }
      })
      .post('/captcha-result', async (ctx) => {
        ctx.body = null;
        const req = ctx.request.body;
        resolve(req);

        server.close((err) => {
          if (err) {
            throw err;
          }
        });
      });

    server.on('listening', async () => {
      const addr = server.address() as AddressInfo;
      const url = `http://${internalIpV4Sync()}:${addr.port}/`;
      terminal('请打开以下链接完成验证码：').brightCyan(url)('\n');

      try {
        await open(url);
      } catch (err) {
        // Do not handle error.
      }
    });
    server.listen();
  });
}
