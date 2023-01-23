// このエンドポイントにおいては、非同期である必要はないが、ほとんどのAPIは非同期であるためasyncハンドラで記述している。
exports.handler = async (event, context) => {
  //レスポンスの雛形
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
    }
  };

  //レスポンスボディにJSON形式の文字列を代入
  response.body = JSON.stringify({ message: "Hello World!" });
  
  // cloudwatch上にログをはく
  console.log(response);
  
  return response;
};
