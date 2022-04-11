/* eslint-disable no-constant-condition */
/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch, { cookieJar } from './fetch.js';
import qrcode from 'qrcode-terminal';
import { CookieString } from './types';
import { SignalLight, sleep } from './util.js';
import terminalKit from 'terminal-kit';

const terminal = terminalKit.terminal;

async function getQRCodeUrl(): Promise<any> {
  const url = 'https://passport.bilibili.com/qrcode/getLoginUrl';
  return fetch(url).json();
}

async function getLoginInfo(oauthKey: string): Promise<any> {
  const url = 'https://passport.bilibili.com/qrcode/getLoginInfo';
  return fetch(url, {
    searchParams: {
      oauthKey,
    },
    method: 'post',
  }).json();
}

async function waitForLogin({
  oauthKey,
  onScan,
}: {
  oauthKey: string;
  onScan: () => void;
}): Promise<boolean> {
  let time = 0;
  let scanned = false;

  while (time < 60000 * 2) {
    const resp = await getLoginInfo(oauthKey);
    if (resp.data === -4) {
      // 等待扫描
    } else if (resp.data === -5) {
      // 等待确认
      if (!scanned) {
        scanned = true;
        onScan();
      }
    } else if (resp.code === 0) {
      // 登录成功。
      return true;
    } else {
      // 其他错误
      throw new Error('登录错误');
    }
    await sleep(3000);
    time += 3000;
  }

  // 二维码过期
  return false;
}

export default async function qrcodeLogin(): Promise<CookieString> {
  while (true) {
    const resp = await getQRCodeUrl();

    if (resp.code !== 0) {
      throw new Error('获取二维码失败。');
    }
    const { oauthKey, url } = resp.data as { oauthKey: string; url: string };

    terminal.clear();
    qrcode.generate(url, {
      small: true,
    });

    const light = new SignalLight('请用哔哩哔哩客户端扫描二维码。');
    const loginResult = await waitForLogin({
      oauthKey,
      onScan: () => {
        light.updateStatus(1, '扫描成功，请点击客户端上的确认登录按钮。');
      },
    });

    if (loginResult) {
      light.updateStatus(2, '登录成功。');
      light.destroy();
      break;
    }
  }
  return cookieJar.getCookieString('https://www.bilibili.com');
}
