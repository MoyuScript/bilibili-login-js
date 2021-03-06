import qrcodeLogin from './qrcode-login.js';
import { CookieString } from './types';
import inquirer from 'inquirer';
import passwordLogin from './password-login.js';

/**
 * 登录哔哩哔哩。
 * @param type 登录方式：`qrcode` 二维码。`password` 密码登录。
 * @returns 登录成功后的 Cookie 字符串。
 */
export default async function loginBilibili(
  type?: 'qrcode' | 'password'
): Promise<CookieString> {
  let type1 = type;

  if (!type1) {
    const answers = await inquirer.prompt([
      {
        type: 'list',
        name: 'type',
        message: '请选择登录方式：',
        default: 'qrcode',
        choices: [
          {
            name: '二维码扫描',
            value: 'qrcode',
          },
          {
            name: '密码登录',
            value: 'password',
          },
          {
            name: '短信验证码登录',
            value: 'sms',
            disabled: '开发中',
          },
        ],
      },
    ]);

    type1 = answers.type;
  }
  switch (type1) {
    case 'qrcode':
      return qrcodeLogin();

    case 'password':
      return passwordLogin();

    default:
      throw new Error(`不支持的登录类型 type="${type1}"`);
  }
}
