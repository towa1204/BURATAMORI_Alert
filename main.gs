function postMessage(message) {
  // ユーザIDとチャネルアクセストークンはスクリプトのプロパティから取得
  let prop = PropertiesService.getScriptProperties().getProperties();
  
  const url = 'https://api.line.me/v2/bot/message/push';
  // チャネルアクセストークン
  const token = prop.ACCESSTOKEN;
  const payload = {
    to: prop.USERID,
    messages: [
      {type: 'text', text: message}
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

const buratamoriURL = 'https://www.nhk.jp/p/buratamori/ts/D8K46WY9MZ/schedule/?area=290';

// ブラタモリの公式サイトから放映日情報のリストを取得
// 戻り値 [{date: <String>, title: <String>, description: <String>}, {...}, ...]
function getOnAirInfoList() {
  const url = buratamoriURL;
  let $ = Cheerio.load(getDynamicPage(url));

  let $onAirInfos = $("div.mobile-schedule ul.list li");

  let onAirInfoList = [];
  for (let i = 0; i < $onAirInfos.length; i++) {
    let onAirInfoObj = {
      date: $onAirInfos.eq(i).find(".on-air-date").text(),
      title: $onAirInfos.eq(i).find("h3.title").text(),
      description: $onAirInfos.eq(i).find(".description p.text").text()
    };
    onAirInfoList.push(onAirInfoObj);
  }
  console.log(onAirInfoList);
  return onAirInfoList;
}

// 呼び出されたときブラタモリのHPから放送情報を取得しLINEに通知
function alertWeekly() {
  let onAirInforList = getOnAirInfoList();
  let message = "";
  for (let i = 0; i < onAirInforList.length; i++) {
    message += onAirInforList[i]["date"] + "\n" + onAirInforList[i]["title"] + "\n" + onAirInforList[i]["description"];
    if (i !== onAirInforList.length - 1) {
      message += "\n\n";
    }
    if (i == onAirInforList.length - 1) {
      message += "\n" + buratamoriURL;
    }
  }
  // console.log(message);
  postMessage(message);
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