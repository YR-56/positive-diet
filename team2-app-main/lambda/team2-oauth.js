// このエンドポイントにおいては、非同期である必要はないが、ほとんどのAPIは非同期であるためasyncハンドラで記述している。
const querystring = require('querystring');
exports.handler = async (event, context) => {
  const randomToken = Math.random().toString(32).substring(2);
  const query = querystring.stringify({
    response_type: 'code',
    client_id: process.env.CHANNELID,
    redirect_uri: 'https://nvsojj7faf.execute-api.ap-northeast-1.amazonaws.com/callback',
    state: randomToken,
    scope: 'profile openid email',
  })

  const lineUrl = 'https://access.line.me/oauth2/v2.1/authorize?' + query;
  const response = {
    statusCode: 301,
    "headers": {
      "Location": lineUrl
    }
  };

  // cloudwatch上にログをはく
  console.log(response);

  return response;
};
