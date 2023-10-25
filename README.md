# Chrome Operation Logger

## 概要
この拡張機能は，Chromeブラウザにおけるユーザの操作ログを収集します．

### 実装内容について
なお，JavaScript初心者によるコーディングなので，かなり問題のある部分があるかと．大目に見てください...  

## 使用上の注意
- この拡張機能は，ブラウザ上でユーザの操作を収集します．場合によってはプライバシーを侵害するような内容を取得する恐れがあります．使用に際しては十分な注意を払ってください．  
- コードの改変や再配布などによって発生した，いかなる損害も保証しませんので，慎重に取り扱ってください．

## 収集するログ
現在この拡張機能が収集するログは以下の通りです．
- ページ遷移
- タブの操作
  - 生成，削除，移動
  - タブグループ関連の操作
- ウィンドウの操作
  - 生成，削除
- ブックマークの操作
  - 登録，削除
- HTTPリクエスト
  - POSTメソッド
- 拡張機能
  - インストール，アンインストール

## インストール
1. この拡張機能のファイルをダウンロードします
2. Chromeブラウザを起動します
3. 拡張機能の管理ページ ( `chrome://extensions/` ) に移動します
4. 右上のスイッチを操作して，開発者モードを有効化します
5. ダウンロードした拡張機能の `src` フォルダをそのまま管理ページにD&Dします

以上の手順で拡張機能がインストールされ，自動で起動します

## 操作方法
### 収集するページの制限選択
- ページの制限は設定ページにて変更できます
- ドメイン名を設定に追加することで，ページ遷移などの範囲を制限できます．
- なお，会員ページのログインなどを行うサイトはPOSTのリストから削除してください．

### ログのダウンロード
- ログをダウンロードするには，拡張機能のポップアップメニューからログを選んでください．  
- ログは，JSONファイルとして自動的に保存されます．

### ログの削除
- ログはブラウザのローカルストレージに保存されています．これを削除するにはポップアップメニューの「ログの削除」ボタンを押してください

## ログの扱いについて
- 上記でも触れていますが，収集されたログはローカルストレージに保存されます．外部サーバに収集したを送信するなどの処理は含まれていません．

## ファイル構成
```
.
├── README.md
└── src
    ├── background.js   // バックグラウンドスクリプト
    ├── manifest.json   //マニフェスト
    ├── option          // 設定ページ関連
    │   ├── option.html
    │   └── option.js
    └── popup           // ポップアップメニュー関連
        ├── popup.html
        └── popup.js
```
