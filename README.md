# BURATAMORI_Alert
ブラタモリの放送日時をLINEに通知してくれるGoogle Apps Script

# 機能
* `doDaily`
  * 実行した日に放映される場合、その放映情報を取得
  * トリガーで1日1回実行することで、毎日放映されるかどうかを確認できます。
* `alertWeekly`
  * 放映情報をすべて取得
  * トリガーで1週間に1回実行することで、今後の放映情報を週毎に確認できます。
# 必要なもの
* このリポジトリのソースコード
* Google Apps Script
* Web API
  * Messaging API(Line Developers)
  * Phantom JS Cloud

Web APIのトークンはGASのスクリプトプロパティに保存し、そこから読み取ります。
事前に、以下のプロパティ名の値にトークンを設定してください。
Messaging APIのトークンは`ACCESSTOKEN`と`USERID`の2つ、
Phantom JS Cloudのトークンは`PHANTOMJSCLOUDID`をプロパティ名としています。

