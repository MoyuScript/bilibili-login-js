/* eslint-disable no-constant-condition */
import { waitForCaptcha } from './captcha.js';
import crypto from 'crypto';
import inquirer from 'inquirer';
import fetch, { cookieJar } from './fetch.js';
import terminalKit from 'terminal-kit';

const term = terminalKit.terminal;

async function getRsaConfig(): Promise<any> {
  return fetch('https://passport.bilibili.com/x/passport-login/web/key').json();
}

function encryptPassword(hash: string, key: string, password: string) {
  const pubKey = crypto.createPublicKey(key);
  const buf = crypto.publicEncrypt(
    {
      key: pubKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    },
    Buffer.from(`${hash}${password}`, 'utf-8')
  );
  return buf.toString('base64');
}

export default async function passwordLogin(): Promise<string> {
  // 获取基础 Cookie
  await fetch('https://passport.bilibili.com/');
  while (true) {
    const { username, password } = await inquirer.prompt([
      {
        type: 'input',
        message: '请输入你的手机号/邮箱',
        name: 'username',
      },
      {
        type: 'password',
        message: '请输入密码',
        name: 'password',
        mask: '*',
      },
    ]);

    const captcha = await waitForCaptcha();
    const rsaConfig = await getRsaConfig();
    const payload = {
      source: 'main_web',
      username,
      password: encryptPassword(
        rsaConfig.data.hash,
        rsaConfig.data.key,
        password
      ),
      keep: true,
      token: captcha.biliToken,
      go_url: 'https://www.bilibili.com/',
      challenge: captcha.geetest_challenge,
      validate: captcha.geetest_validate,
      seccode: captcha.geetest_seccode,
    };

    const result = (await fetch(
      'https://passport.bilibili.com/x/passport-login/web/login',
      {
        method: 'POST',
        form: payload,
      }
    ).json()) as any;

    if (result.code !== 0) {
      term.error.brightRed(`登录失败：${result.message}\n`);
    } else {
      break;
    }
  }
  return cookieJar.getCookieStringSync('https://www.bilibili.com');
}
