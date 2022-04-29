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

// 1日1回呼び出し、放送リストの更新処理・通知処理を行う
function doDaily() {
  // 放送リストの取得
  let onAirInfoList = getOnAirInfoList();

  // let test_str = "4月23日（土） 午後7:30 〜 午後8:15";

  // 通知処理
    // 当日の放送される回であればLINEに通知
  let today = new Date();
  for (let i = 0; i < onAirInfoList.length; i++) {
    let date = convertNHKDate(onAirInfoList[i]["date"]);
    // console.log(today);
    // console.log(date);

    // 当日であればLINEに通知
    if (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() 
        && date.getDate() === today.getDate()) {
      let message = "今日はブラタモリが放映されます。\n\n";
      message += onAirInfoList[i]["date"] + "\n" + onAirInfoList[i]["title"] + "\n" + onAirInfoList[i]["description"];
      message += "\n" + buratamoriURL;
      console.log(message);
      postMessage(message);
    }
  }
}

// NHKの放送日形式 "mm月dd日（wd） 午後hours:minute 〜 午後hours:minute" を Dateオブジェクト yyyy/mm/dd に変換
function convertNHKDate(nhkDate) {
  // 切り出して mm月dd日（wd）の形式

  let monthDay = ""; // "mm/dd"の文字列を以下の処理で作成 "/"でsplitして使う
  for (let i = 0; i < nhkDate.length; i++) {
    if (nhkDate[i] === "月") {
      monthDay += "/"
    } else if (nhkDate[i] === "日") {
      break;
    } else {
      monthDay += nhkDate[i];
    }
  }

  let today = new Date(); // プログラム実行時の日時
  // プログラムを実行時の月が12月で放送予定日が1月のとき年を加算
    // さすがに12月末の放送予定に2月の内容はないと思われるので1月のみに対応
  let year = today.getFullYear();
  if (today.getMonth() === 11 && monthDay.split("/")[0] === "1") {
    year++;
  }
  let date = new Date(year, monthDay.split("/")[0] - 1, monthDay.split("/")[1]);
  
  return date;
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
  if (message === "") {
    message = "今週の放送予定日はありません。";
  }
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