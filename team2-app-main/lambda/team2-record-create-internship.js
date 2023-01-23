const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TableName = "team2-Record";

exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  const body = event.body ? JSON.parse(event.body) : null;

  const userId = body.userId;
  const timestamp = Date.now();

  //recordId 自動生成
  const recordId = createId();
  const training = body.training;
  const number = body.num;


  if (!userId || !training) {
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "無効なリクエストです。request bodyに必須パラメータがセットされていません。"
    });
  }


  const param = {
    "TableName": "team2-Record",
    "Item": {
      recordId,
      training,
      timestamp,
      number,
      userId
    }
  };

  try{
    // dynamo.put()でDBにデータを登録
    await dynamo.put(param).promise();
    response.statusCode = 201;
    response.body = JSON.stringify({ userId, timestamp,});

  } catch (e){
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString()
    });
  }

  return response;
}

const createId = () => {
  const chars = 'gagakdgahodgakoxcqls12345678910';
  let randId = '';
  for (var i = 0; i < 8; i++) {
    randId += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return randId;
}