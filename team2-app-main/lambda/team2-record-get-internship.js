const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TableName = "team2-Record";

/*** 通常版の解答例(発展課題を含む最終版は下にあります。) ***/
exports.handler = async (event, context) => {
  //レスポンスの雛形
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ message: "" }),
  };

  const userId = event.queryStringParameters.userId; //見たいユーザのuserId

  const param = {
    TableName
  };

  //dynamo.get()でDBからデータを取得
  try {
    const records = (await dynamo.scan(param).promise()).Items;
    const myRecords = records.filter(record => record.userId == userId);

    if(myRecords.length == 0) {
      throw new Error("指定されたuserIdを持つrecordsは見つかりません");
    }
    response.body = JSON.stringify({records: myRecords})

  } catch (e) {
    if (e.message == "指定されたuserIdを持つrecordsは見つかりません") {
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: e.message
      });
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