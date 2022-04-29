# BURATAMORI_Alert
ブラタモリの放送日時をLINEに通知してくれるGoogle Apps Script

# 機能

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

