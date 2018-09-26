function createMessage() {
  // GithubのAPIを叩く
  const json  = fetchCommitTotal();
  const repos = [json.data.gas];
  const branch = {
    "gas" : repos[0].refs.edges 
  };
  const total = {
    "gas" : repos[0].refs.nodes
  };

  // JSONを整形し、プロジェクト毎のブランチとコミット数を取得
  const gas = prepareInfo(branch.gas, total.gas);
  const projectName = ['Gas'];
  const project     = [gas];

  const today         = formatDate(0);
  const oneWeekBefore = formatDate(-7);
  const time = new Date();
  const hour = time.getHours();
  const triggerTime = hour + ':00:00';

  // メッセージの作成
  var message = '今週もお疲れ様でした😊\n';
  message += '今週のプロジェクト毎のコミット数を集計しました。\n';
  message += '(集計期間 ' + oneWeekBefore + ' ' + triggerTime + ' ~ ' + today + ' ' + triggerTime + ')\n\n';

  for (i = 0, len = project.length; i < len; ++i) {
    message += 'プロジェクト名： *' + projectName[i];
    message += '* \n ```' + project[i] + '```\n\n';
  }

  // Slackに送る
  const to = PropertiesService.getScriptProperties().getProperty("TO");
  sendToSlack(message, to);
}

function prepareInfo(branch, total) {
  const branchName  = [];
  const commitTotal = [];
  const data        = [];

  for (var i = 0, len = branch.length; i < len; ++i) {
    // コミット数が0のブランチを除外    
    if(parseInt(total[i].target.history.totalCount) === 0) {
      continue;
    }

    // 配列にオブジェクトを格納
    data.push({
      "branchName"  : branch[i].node.name,
      "commitTotal" : total[i].target.history.totalCount
    });
  }  

  var info = '';
  var sum = 0;

  for (var i = 0, len = data.length; i < len; ++i) {
    info += data[i].branchName + ' のコミット数は ' + data[i].commitTotal + '件' + '\n'; 
    sum += data[i].commitTotal;
  }

  info += '合計' + sum + '件です。';

  return info;
}

function fetchCommitTotal() {
  const url   = 'https://api.github.com/graphql';
  const token = PropertiesService.getScriptProperties().getProperty("TOKEN");
  const oneWeekBefore = formatDate(-7);

  const graphql = ' \
{ \
  gas: repository(owner: "panda_program", name: "gas") {\
    ...RepoFragment\
  }\
}\
fragment RepoFragment on Repository {\
  refs(first: 100, refPrefix:"refs/heads/") {\
    edges {\
      node {\
        name\
      }\
    }\
    nodes {\
        target {\
      ... on Commit {\
        history(first: 0, since: "'
         + oneWeekBefore + 
        'T09:00:00.000+09:00\"  ) {\
          totalCount\
        }\
       }\
     }\
   }\
 }\
}\
';

  const options = {
    'method' : 'post',
    'contentType' : 'application/json',
    'headers' : {
      'Authorization' : 'Bearer ' +  token
     },
    'payload' : JSON.stringify({ query : graphql })
  };

  const response = UrlFetchApp.fetch(url, options);
  const json     = JSON.parse(response.getContentText());

  return json;
}

/** 日付をフォーマットする
 *  @param  {int} days
 */ @return {string} YYYY-MM-DD
function formatDate(days) {
  const now = new Date;
  const oneWeekBefore = new Date(now.getFullYear(), now.getMonth(), now.getDate() + days);
  const year    = oneWeekBefore.getFullYear();
  const month   = ('0' + (oneWeekBefore.getMonth() + 1)).slice(-2);
  const date    = ('0' + oneWeekBefore.getDate()).slice(-2);
  const format  = year+ '-' + month + '-' + date;

  return format;
}

function sendToSlack(body, channel) {
  const url = PropertiesService.getScriptProperties().getProperty("WEBHOOK_URL");

  // Slackに通知する際の名前、色、画像を決定する
  const data = { 
    'channel' : channel,
    'username' : 'Octocat',
    'attachments': [{
      'color': '#fc166a',
      'text' : body,
    }],
    'icon_url' : 'https://assets-cdn.github.com/images/modules/logos_page/Octocat.png'
  };

  const payload = JSON.stringify(data);
  const options = {
    'method' : 'POST',
    'contentType' : 'application/json',
    'payload' : payload
  };

  UrlFetchApp.fetch(url, options);
}