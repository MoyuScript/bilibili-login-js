/* eslint-disable no-undef */
async function proxy(payload) {
  return (await fetch('/proxy', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'content-type': 'application/json'
    }
  })).json();
}
/* eslint-disable no-undef */
async function getCaptchaInfo() {
  const resp = await proxy({
    url: 'https://passport.bilibili.com/x/passport-login/captcha',
  });
  return JSON.parse(resp.data);
}

(async () => {
  const captchaInfo = (await getCaptchaInfo()).data;

  initGeetest({
    ...captchaInfo.geetest,
    product: 'bind'
  }, (captchaObj) => {
    captchaObj.appendTo('body');
    captchaObj.onSuccess(() => {
      const validate = captchaObj.getValidate();
      document.write('验证完成，你可以关闭此页面了。');
      fetch('/captcha-result', {
        method: 'POST',
        body: JSON.stringify({
          ...validate,
          biliToken: captchaInfo.token
        }),
        headers: {
          'content-type': 'application/json'
        }
      });
    });
    captchaObj.onReady(() => captchaObj.verify());
  });
})();
