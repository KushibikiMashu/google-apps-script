var NIKKEI_KAIRIRITSU = PropertiesService.getScriptProperties().getProperty("NIKKEI_KAIRIRITSU");
var NIKKEI_KAIRIRITSU_URL = 'http://kabusensor.com/nk/';

function nikkeiHeikinMain() {
    const today = new Date();
    if (isWeekend(today) || isHoliday(today)) {
        return;
    }
    const sheet = getNikkeiKairiritsuSheet();
    setRaw(sheet);
}

function postNikkeiHeikinTweet() {
    const today = new Date();
    if (isWeekend(today) || isHoliday(today)) {
        return;
    }

    const sheet = getNikkeiKairiritsuSheet();
    const body = getBody(sheet);
    Logger.log(body);
    postTweet(body);

}

function getItems(html) {
    const regexp = /<div class="mtop10 under01">.*?<\/div>/g;
    const itemRegexp = new RegExp(regexp);
    return html.match(itemRegexp);
}

function getTarget(html) {
    var target = '';
    const tags = ['<li class="mleft10">', '</li>'];
    const item = /<li class="mleft10">.*?<\/li>/;
    const regexp = new RegExp(item);
    const length = Object.keys(html).length;

    for (var i = 0; i < length; ++i) {
        var itemWithTag = html[i].match(regexp);
        var title = deleteTags(itemWithTag[0], tags);
        if (title === '乖離率(25日)') {
            target = html[i];
        }
    }
    return target;
}

function deleteTags(string, tags) {
    const length = tags.length;
    for (var i = 0; i < length; ++i) {
        string = string.replace(tags[i], '');
    }
    return string;
}

function getNumber(html) {
    const tags = ['<li class="fs20 fbold mleft20">', '</li>'];
    const item = /<li class="fs20 fbold mleft20">.*?<\/li>/;
    const regexp = new RegExp(item);
    const string = html.match(regexp)[0];
    const rate = deleteTags(string, tags);
    return rate;
}

function getRate() {
    const res = request(NIKKEI_KAIRIRITSU_URL);
    const items = getItems(res);
    const target = getTarget(items);
    return getNumber(target);
}

function getNikkeiKairiritsuSheet() {
    return SpreadsheetApp.openById(NIKKEI_KAIRIRITSU).getSheetByName('日経乖離率');
}

function getTitles(sheet) {
    return sheet.getRange(1, 1, 1, 4).getValues();
}

function getToday() {
    const now = new Date();
    const year = now.getYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    return [year, month, date];
}

function setDate(sheet) {
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    const today = getToday();
    sheet.getRange(lastRow + 1, 1, 1, 3).setValues(today);
}

function setRaw(sheet) {
    const today = getToday();
    const rate = getRate();
    const values = [];
    values.push(today);
    values[0].push(rate);

    const lastRow = sheet.getLastRow();
    sheet.getRange(lastRow + 1, 1, 1, 4).setValues(values);
}

function isWeekend(today) {
    const day = today.getDay();
    return (day === 6) || (day === 0);
}

function isHoliday(today) {
    const calendars = CalendarApp.getCalendarsByName('日本の祝日');
    const count = calendars[0].getEventsForDay(today).length;
    return count !== 0;
}

function getRecentRates(sheet) {
    const lastRow = sheet.getLastRow();
    const values = sheet.getRange(lastRow - 7, 2, 7, 3).getValues();
    return values;
}

function getBody(sheet) {
    var body = '日経平均📈' + "\r\n" + '25日平均線乖離率' + "\r\n";
    const rates = getRecentRates(sheet);
    for (var row in rates) {
        var percentage = (rates[row][2] * 100).toString() + '％';
        body += rates[row][0] + '/' + rates[row][1] + ' : ' + percentage + "\r\n";
    }
    return body;
}