const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TableName = "team2-User";

exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  const body = event.body? JSON.parse(event.body) : null;
  if(!body || !body.userId || !body.password){
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "無効なリクエストです。request bodyに必須パラメータがセットされていません。"
    });

    return response;
  }

  const param = {
    TableName,
    //キー、インデックスによる検索の定義
    KeyConditionExpression: "userId = :uid",
    //プライマリーキー以外の属性でのフィルタ
    FilterExpression: "password = :pkey",
    //検索値のプレースホルダの定義
    ExpressionAttributeValues: {
      ":uid": body.userId,
      ":pkey": body.password
    },
  };

  try{
    const foundCount = (await dynamo.query(param).promise()).Count;
    if(foundCount == 0){
      throw new Error("userIdまたはpasswordが一致しません");
    }
    response.body = JSON.stringify({token: "mtiToken"});

  }catch(e){
    if (e.message == "userIdまたはpasswordが一致しません") {
      response.statusCode = 401;
      response.body = JSON.stringify({ message: e.message });
    } else {
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: "予期せぬエラーが発生しました。",
        errorDetail: e.toString()
      });
    }
  }

  return response;
};
