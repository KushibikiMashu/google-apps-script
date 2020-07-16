// GASをエンドポイントにするコード

// 手順
// 1. 実行可能ユーザーをanyoneにする
// 2. 公開用APIとする
// 3. リクエストを送る側でredirectを追いかける設定をする

// https://developers.google.com/apps-script/guides/web
const doGet = () => {
  return ContentService.createTextOutput(JSON.stringify({name: 'World'})).setMimeType(
    ContentService.MimeType.JSON
  );
}

// 参考
// https://qiita.com/kunichiko/items/7f64c7c80b44b15371a3
