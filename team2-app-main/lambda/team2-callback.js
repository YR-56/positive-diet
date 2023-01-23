// このエンドポイントにおいては、非同期である必要はないが、ほとんどのAPIは非同期であるためasyncハンドラで記述している。
const fetch = require('node-fetch');
const lineApiUrl = 'https://api.line.me/oauth2/v2.1';
const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TableName = "team2-User";

exports.handler = async (event, context) => {
  const code = event.queryStringParameters.code;
  const idToken = await fetchToken(code);
  const userInfo = await fetchUserInfo(idToken);
  const lineId = userInfo.sub;
  let userId = new Date().getTime().toString(16);

  // todo ユーザー登録を行う予定
  const getUserParam = {
    TableName
  };

  try {
    const users = (await dynamo.scan(getUserParam).promise());
    const user = users.Items.find(user => {user.lineId == lineId});
    const timestamp = Date.now();
    // ユーザーが存在していなければ登録
    if(user == undefined) {
      const createParam = {
        TableName,
        Item: {
          userId,
          lineId,
          timestamp
        }
      }
      await dynamo.put(createParam).promise();
    } else {
      userId = user.userId;
    }
  } catch (e) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "予期せぬエラーが発生しました。",
        errorDetail: e.toString()
      })
    }
  }

  const url = 'https://team2-internship.s3.ap-northeast-1.amazonaws.com/index.html#/line' + `?userId=${userId}`;
  const response = {
    statusCode: 301,
    "headers": {
      "Location": url
    }
  }

  return response;
};

// アクセストークン取得
const fetchToken = async(code) => {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded"
  }
  const body = {
    grant_type: 'authorization_code',
    code: code,
    redirect_uri: 'https://nvsojj7faf.execute-api.ap-northeast-1.amazonaws.com/callback',
    client_id: process.env.CHANNELID,
    client_secret: process.env.SECRET
  }
  const fetchUrl = lineApiUrl + '/token';
  const res = await fetch(fetchUrl, {
    method: 'post',
    body: new URLSearchParams(body),
    headers: headers
  });

  const data = await res.json();
  const idToken = data.id_token;
  return idToken;
}

// ユーザー情報取得
const fetchUserInfo = async(idToken) => {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded"
  }

  const body = {
    id_token: idToken,
    client_id: process.env.CHANNELID
  }

  const fetchUrl = lineApiUrl + '/verify';
  const res = await fetch(fetchUrl, {
    method: 'post',
    body: new URLSearchParams(body),
    headers: headers
  });

  const data = await res.json();
  return data;
}
