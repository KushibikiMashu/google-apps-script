const TOKEN = PropertiesService.getScriptProperties().getProperty('LINE_NOTIFY_TOKEN')
const ENDPOINT = 'https://notify-api.line.me/api/notify'

const ss = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('ポートフォリオ')
const range = ss.getRange('B2:Q10')
// O列の埋まっているセルで、一番下の行の数字を取得
const numRows = ss.getRange('O:O').getValues().filter(String).length - 1

function getMessage() {
  const dollar = getCurrency(5)
  const yen = getSum(10)
  const hkd = getCurrency(13)
  const sum = getSum(1)
  const dollerRate = getRate(15)
  const HkdRate = getRate(16).toString().slice(0, 5)
  
  Logger.log(range, numRows)  
  Logger.log([dollar, yen, sum, dollerRate, HkdRate])
  return `${dollar} / ${yen} / ${hkd} / ${sum} / ${dollerRate} / ${HkdRate}`
}

const getCurrency = (numCol) => range.getCell(numRows, numCol).getValue().toLocaleString()
const getSum = (numCol) => Math.floor(range.getCell(numRows, numCol).getValue()).toLocaleString()
const getRate = (numCol) => range.getCell(numRows, numCol).getValue()

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

