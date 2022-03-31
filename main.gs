function postMessage() {
  // ユーザIDとチャネルアクセストークンはスクリプトのプロパティから取得
  let prop = PropertiesService.getScriptProperties().getProperties();
  
  const url = 'https://api.line.me/v2/bot/message/push';
  // チャネルアクセストークン
  const token = prop.ACCESSTOKEN;
  const payload = {
    to: prop.USERID,
    messages: [
      {type: 'text', text: 'Hello, world!'}
    ]
  };

  const params = {
    method: 'post',
    contentType: 'application/json',
    headers: {
      Authorization: 'Bearer ' + token
    },
    payload: JSON.stringify(payload)
  };

  UrlFetchApp.fetch(url, params);
}

// ブラタモリの公式サイトから放映日情報のリストを取得
// 戻り値 [{date: <Dateオブジェクト>, title: <String>, description: <String>}, {...}, ...]
function getOnAirInfoList() {
  const url = 'https://www.nhk.jp/p/buratamori/ts/D8K46WY9MZ/schedule/?area=290';
  let $ = Cheerio.load(getDynamicPage(url));

  let $onAirInfos = $("div.mobile-schedule ul.list li");
  console.log($onAirInfos.html());
  console.log($onAirInfos.length);
  // タイトルの表示
  console.log($onAirInfos.eq(0).find(".title-group").text());
  // 放映日の表示
  console.log($onAirInfos.eq(0).find(".on-air-date").text());
  // 説明の表示
  console.log($onAirInfos.eq(0).find(".description").text());
}

// PhantomJsCloudを利用して動的ページを取得
function getDynamicPage(requestURL) {
  // APIkeyはスクリプトのプロパティから取得
  let key = PropertiesService.getScriptProperties().getProperty('PHANTOMJSCLOUDID');
  
  // HTTPSレスポンスに設定するペイロードのオプション項目を設定
  let option = {
    url: requestURL,
    renderType: "HTML",
    outputAsJson: true
  };

  // オプション項目をJSONにしてペイロードとして定義し、エンコード
  let payload = JSON.stringify(option);
  payload = encodeURIComponent(payload);
  // PhantomJsCloudのAPIリクエストを行うためのURLを設定
  let apiURL = "https://phantomjscloud.com/api/browser/v2/"+ key +"/?request=" + payload;

  let response = UrlFetchApp.fetch(apiURL);
  let json = JSON.parse(response.getContentText());
  let source = json["content"]["data"];

  return source;
}