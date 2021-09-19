const TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_NOTIFY_TOKEN')
const ENDPOINT = 'https://notify-api.line.me/api/notify'

const activeSheet = SpreadsheetApp.getActiveSpreadsheet()
const isSunday = new Date().getDay() === 0

function getData() {
  const ss = activeSheet.getSheetByName('ポートフォリオ')
  const range = ss.getRange('B2:R19')
  // O列の埋まっているセルで、一番下の行の数字を取得
  const numRows = ss.getRange('O:O').getValues().filter(String).length - 1

  const getCurrency = (numCol) => range.getCell(numRows, numCol).getValue().toLocaleString()
  const getSum = (numCol) => Math.floor(range.getCell(numRows, numCol).getValue()).toLocaleString()
  const getRate = (numCol) => range.getCell(numRows, numCol).getValue()

  return {
    dollar: getCurrency(5),
    yen: getSum(10),
    hkd: getCurrency(13),
    sum: getSum(1),
    riskSum: getSum(2),
    dollarRate: getRate(15),
    HkdRate: getRate(16).toString().slice(0, 5),
    btc: getSum(17),
  }
}

// LINEメッセージにする
function getMessage() {
  const {dollar, yen, hkd, sum, dollarRate, HkdRate, btc} = getData()

  Logger.log([dollar, yen, sum, dollarRate, HkdRate, btc])
  return `${dollar} / ${yen} / ${hkd} / ${sum} / ${dollarRate} / ${HkdRate} / ${btc}`
}

// SSに書き込む
function write() {
  if (isSunday) {
    return
  }

  const date = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy/MM/dd')
  const {dollar, yen, hkd, sum, riskSum, btc} = getData()
  const record = [[date, sum, riskSum, dollar, yen, hkd, btc]]

  const ss = activeSheet.getSheetByName('記録')
  const lastRow = ss.getLastRow()
  // 先頭のセルの行、カラム、そして行数と列数
  ss.getRange(lastRow + 1, 1, 1, 7).setValues(record)
}

function getHeaders() {
  return {
    "Content-Type": "application/x-www-form-urlencoded",
    "Authorization": `Bearer ${TOKEN}`
  }
}

function getPayload() {
  const params = {
    'message': getMessage(),
  }

  let body = [];
  Object.keys(params).map(key => {
    body.push(key + '=' + encodeURI(params[key]));
  })
  return body.join("&")
}

function send() {
  if (isSunday) {
    return
  }

  const options = {
    "method": "POST",
    "headers": getHeaders(),
    "payload": getPayload(),
    "muteHttpExceptions": true
  }
  Logger.log(getPayload());
  const res = UrlFetchApp.fetch(ENDPOINT, options);
  Logger.log(res.getContentText());
}

