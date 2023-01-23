// このエンドポイントにおいては、非同期である必要はないが、ほとんどのAPIは非同期であるためasyncハンドラで記述している。
const line = require('@line/bot-sdk');
const client = new line.Client({ channelAccessToken: process.env.TOKEN });
const crypto = require("crypto");

exports.handler = async (event, context) => {
  // 署名確認
  if(!checkSignature(event)) {
    return {
      statusCode: 401
    }
  };

  const body = JSON.parse(event.body);
  await Promise.all(body.events.map(replyMessage))
};

const checkSignature = (event) => {
  let signature = crypto
    .createHmac("sha256", process.env.SECRET)
    .update(event.body)
    .digest("base64");
  let checkHeader = (event.headers || {})["x-line-signature"];

  return (signature === checkHeader);
}

const replyMessage = async(bodyEvent) => {
  console.log('bodyEvent: ', bodyEvent);
  const replyToken = bodyEvent.replyToken;
  const message = bodyEvent.message.text;
  let lineResponse = {
    type: "text",
    text: message,
  };
  switch (message) {
    case 'トレーニングの記録':
      lineResponse.text = 'トレーニングの記録ですね。なんのトレーニングをしましたか？'
      break;
    default:
      console.log('default');
      if(isNaN(message)) {
        // 文字列の場合
        lineResponse.text = `${message}ですね。何回やりましたか？`
      } else {
        // 数字の場合
        lineResponse = [
          {
            type: 'text',
            text: `${message}回で記録します`
          },
          {
            type: 'text',
            text: 'お疲れさまでした'
          }
        ]
      }
    break;
  }
  console.log('lineResponse: ', lineResponse);
  await client.replyMessage(replyToken, lineResponse);
  return;
}