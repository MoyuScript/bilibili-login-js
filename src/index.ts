import qrcodeLogin from './qrcode-login.js';
import { CookieString } from './types';

/**
 * 登录哔哩哔哩。
 * @param type 登录方式：`qrcode` 二维码。
 * @returns 登录成功后的 Cookie 字符串。
 */
export default async function loginBilibili(
  type: 'qrcode'
): Promise<CookieString> {
  switch (type) {
    case 'qrcode':
      return qrcodeLogin();

    default:
      throw new Error(`不支持的登录类型 type="${type}"`);
  }
}
