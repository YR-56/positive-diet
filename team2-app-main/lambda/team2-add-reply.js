const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TableName = "team2-Action";
const fetch = require('node-fetch')

exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  // 今回は簡易的な実装だが、一般的にはAuthorizationHeaderの値は、Authorization: <type> <credentials>のような形式になります。
  // https://developer.mozilla.org/ja/docs/Web/HTTP/Headers/Authorization#%E6%A7%8B%E6%96%87
  if(event.headers.authorization !== "mtiToken"){
    response.statusCode = 401;
    response.body = JSON.stringify({
      message: "認証されていません。HeaderにTokenを指定してください"
    });

    return response;
  }

  const body = event.body? JSON.parse(event.body) : null;
  if(!body || !body.userId || !body.text){
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "無効なリクエストです。request bodyに必須パラメータがセットされていません。"
    });

    return response;
  }

  // { varName }のような形式を分割代入と呼び、右側のオブジェクトの中からvarNameプロパティを変数varNameとして切り出すことができる
  // (https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
  //const { userId, text, authorId, timestamp} = body;

  const { userId, actionId, text, timestamp} = body;
  let replys = body.replys;
  const article_text = body.article_text;

  const result = await checkSentiment(text);
  if (result.sentiment == 'Negative') {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "ネガティブな文章と判断されました。"
    });

    return response;
  }

  if(replys == undefined) {
    replys = [];
  }
  replys.push({userId, timestamp: Date.now(), text});

  const param = {
    // ↓プロパティ名と変数名が同一の場合は、値の指定を省略できる。
    TableName,  // TableName: TableNameと同じ意味
    Item: {
      actionId,
      replys,
      text: article_text,
      timestamp,
      userId
    }
  };

  try{
    await dynamo.put(param).promise();
    response.statusCode = 201;
    response.body = JSON.stringify({replys});
  }catch(e){
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString()
    });
  }

  return response;
};

const checkSentiment = async (sentence) => {
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
    sentence: sentence
  }
  const sentimentRes = await fetch(sentimentUrl, {
    method: 'post',
    body: JSON.stringify(sentimentRequestBody),
    headers: sentimentHeaders
  });
  const sentimentData = await sentimentRes.json();
  const result = sentimentData.result;

  return result;
}