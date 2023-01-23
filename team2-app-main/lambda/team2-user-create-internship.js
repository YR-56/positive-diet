const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TableName = "team2-User";

/*** 通常版の解答例(発展課題を含む最終版は下にあります。) ***/
exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  // { varName }のような形式を分割代入と呼び、右側のオブジェクトの中からvarNameプロパティを変数varNameとして切り出すことができる
  // (https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
  const { userId, name, email, password, target } = JSON.parse(event.body);
  const param = {
    // ↓プロパティ名と変数名が同一の場合は、値の指定を省略できる。
    TableName,  // TableName: TableNameと同じ意味
    Item: {
      userId,   // userId: userIdと同じ意味
      name,
      email,
      password,
      target
    }
  };

  try{
    await dynamo.put(param).promise();
    response.statusCode = 201;
    response.body = JSON.stringify({userId, name, email, target});
  }catch(e){
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString()
    });
  }

  return response;
}



/*** 発展課題も含む最終版 ***/
exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };
  console.log("1")

  const body = event.body? JSON.parse(event.body) : null;
  if(!body || !body.userId || !body.name || !body.email || !body.password || !body.target){
    response.statusCode = 400;
    response.body = JSON.stringify({
      message: "無効なリクエストです。request bodyに必須パラメータがセットされていません。"
    });

    return response;
  }

  // { varName }のような形式を分割代入と呼び、右側のオブジェクトの中からvarNameプロパティを変数varNameとして切り出すことができる
  // (https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Operators/Destructuring_assignment)
  const { userId, name, email, password, target} = body;
  const param = {
    // ↓プロパティ名と変数名が同一の場合は、値の指定を省略できる。
    TableName,  // TableName: TableNameと同じ意味
    Item: {
      userId,   // userId: userIdと同じ意味
      name,
      email,
      password,
      target
    }
  };

  try{
    await dynamo.put(param).promise();
    response.statusCode = 201;
    response.body = JSON.stringify({userId, name, email, target, token: "mtiToken"});
  }catch(e){
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "予期せぬエラーが発生しました。",
      errorDetail: e.toString()
    });
  }

  return response;
};
