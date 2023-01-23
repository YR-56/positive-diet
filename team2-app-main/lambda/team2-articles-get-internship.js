const AWS = require("aws-sdk");
const dynamo = new AWS.DynamoDB.DocumentClient();
const TableName = "team2-Action";

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

  const { hasValidQs, param } = createParam(event.queryStringParameters);

  try{
    const articles = hasValidQs
    ? (await dynamo.query(param).promise()).Items
    : (await dynamo.scan(param).promise()).Items;

    if(articles.length == 0){
      throw new Error("記事が見つかりません");
    }

    articles.sort((a,b) => b.timestamp - a.timestamp);
    response.body = JSON.stringify({ articles });

  }catch(e){
    if (e.message == "記事が見つかりません") {
      response.statusCode = 404;
      response.body = JSON.stringify({
        message: e.message
      });
    }else{
      response.statusCode = 500;
      response.body = JSON.stringify({
        message: "予期せぬエラーが発生しました。",
        errorDetail: e.toString()
      });
    }
  }

  return response;
};

// qsの内容に応じて、Paramを作成する。
const createParam = (qs) => {
  // Query操作には、パーティションキーは必須であり、他は任意となる。
  // そのためuserIdさえあれば、有効となる。
  const hasValidQs = qs?.userId;
  if(!hasValidQs){
    return {
      hasValidQs,
      param: {
        // ↓プロパティ名と変数名が同一の場合は、値の指定を省略できる。
        TableName, // TableName: TableNameと同じ意味
        Limit: 100
      }
    }
  }

  const { userId, start, end, category } = qs;

  const queryParam = {
    TableName, // TableName: TableNameと同じ意味
    Limit: 100,

    // 一つのキーに複数の条件をつけることはできないため、BETWEEN演算を利用する
    KeyConditionExpression: "userId = :uid and #ts BETWEEN :start AND :end",
    // timestampは予約後であるため、プレースホルダ経由じゃないと指定できない。
    ExpressionAttributeNames: {
      "#ts": "timestamp"
    },
    ExpressionAttributeValues: {
      ":uid": userId,
      // startが無効な場合は、0以上という条件にすることで、実質フィルタリング無効化
      ":start": Number.isNaN(parseInt(start))? 0 : parseInt(start),
      // endが無効な場合は、現在時刻以下という条件にすることで、実質フィルタリング無効化
      ":end": Number.isNaN(parseInt(end))? Date.now() : parseInt(end),
    },
  }

  // categoryが存在する場合は別途該当のプロパティを追加する。
  if(category){
    queryParam.FilterExpression = "category = :category";
    queryParam.ExpressionAttributeValues[":category"] = category;
  }

  return {
    hasValidQs,
    param: queryParam
  }
}