// このエンドポイントにおいては、非同期である必要はないが、ほとんどのAPIは非同期であるためasyncハンドラで記述している。
const fetch = require('node-fetch')
exports.handler = async (event) => {
  const baseUrl = 'https://api.ce-cotoha.com';

  // アクセストークン取得
  const oAuthUrl = baseUrl + '/v1/oauth/accesstokens';
  const clientId = process.env.CLIENT_ID;
  const secret = process.env.SECRET;
  let headers = {
    'Content-Type': 'application/json'
  }
  const requestBody = {
    grantType: "client_credentials",
    clientId: clientId,
    clientSecret: secret
  }
  const res = await fetch(oAuthUrl, {
    method: 'post',
    body: JSON.stringify(requestBody),
    headers: headers
  });
  const data = await res.json();
  const accessToken = data.access_token;

  // 感情分析
  const sentimentUrl = baseUrl + '/api/dev/nlp/v1/sentiment';
  const sentimentHeaders = {
    'Content-Type': 'application/json;charset=UTF-8',
    'Authorization': `Bearer ${accessToken}`
  }
  const sentimentRequestBody = {
    sentence: event.sentence
  }
  const sentimentRes = await fetch(sentimentUrl, {
    method: 'post',
    body: JSON.stringify(sentimentRequestBody),
    headers: sentimentHeaders
  });
  const sentimentData = await sentimentRes.json();
  const result = sentimentData.result;

  return result;
};