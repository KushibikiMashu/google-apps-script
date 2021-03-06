var CONSUMER_KEY = PropertiesService.getScriptProperties().getProperty("CONSUMER_KEY");
var CONSUMER_SECRET = PropertiesService.getScriptProperties().getProperty("CONSUMER_SECRET");

// シートを選択
var sheet = SpreadsheetApp.getActive().getSheetByName('sheetName');

function reportDailyPageViewsTotwitter() {
  // 土曜日はツイートしない
  var today = new Date;
  var day = today.getDay();
  if (day === 6){
    return;
  }
  
  // ツイートする
  var tweet = getPageViewsOfOneDayBefore(sheet); 
  run(tweet);
}

function reportWeeklyPageViewsTotwitter() {
  // 土曜日だけ作動するようにトリガーを設定
  const value = sheet.getRange('B12').getValue();
  
  var tweet = getPageViewsOfOneDayBefore(sheet);
  tweet += "\r\n";
  tweet += '今週の合計PV数は' + value + 'です。';
  
  run(tweet);
}

function getPageViewsOfOneDayBefore(sheet){
  const values = sheet.getRange('A21:B22').getValues();

  var tweet = '';
  tweet += Utilities.formatDate(new Date(values[1][0]), 'Asia/Tokyo', 'MM月dd日');
  tweet += 'のQiitaのPV数は' + values[1][1];
  tweet += '（前日比' + Math.floor((values[1][1] / values[0][1]) * 100) + '%)です。';
  
  return tweet;
}

/**
 * 以下はTwitter投稿のライブラリ用の関数
 * Authorizes and makes a request to the Twitter API.
 */
function run(tweet) {
  var service = getService();
  if (service.hasAccess()) {
    var url = 'https://api.twitter.com/1.1/statuses/update.json';
    var payload = {
      status: tweet
    };
    var response = service.fetch(url, {
      method: 'post',
      payload: payload
    });
    var result = JSON.parse(response.getContentText());
    Logger.log(JSON.stringify(result, null, 2));
  } else {
    var authorizationUrl = service.authorize();
    Logger.log('Open the following URL and re-run the script: %s',
        authorizationUrl);
  }
} 

/**
 * Reset the authorization state, so that it can be re-tested.
 */
function reset() {
  var service = getService();
  service.reset();
}

/**
 * Configures the service.
 */
function getService() {
  return OAuth1.createService('Twitter')
      // Set the endpoint URLs.
      .setAccessTokenUrl('https://api.twitter.com/oauth/access_token')
      .setRequestTokenUrl('https://api.twitter.com/oauth/request_token')
      .setAuthorizationUrl('https://api.twitter.com/oauth/authorize')

      // Set the consumer key and secret.
      .setConsumerKey(CONSUMER_KEY)
      .setConsumerSecret(CONSUMER_SECRET)

      // Set the name of the callback function in the script referenced
      // above that should be invoked to complete the OAuth flow.
      .setCallbackFunction('authCallback')

      // Set the property store where authorized tokens should be persisted.
      .setPropertyStore(PropertiesService.getUserProperties());
}

/**
 * Handles the OAuth callback.
 */
function authCallback(request) {
  var service = getService();
  var authorized = service.handleCallback(request);
  if (authorized) {
    return HtmlService.createHtmlOutput('Success!');
  } else {
    return HtmlService.createHtmlOutput('Denied');
  }
}