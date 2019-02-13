var NIKKEI_KAIRIRITSU = PropertiesService.getScriptProperties().getProperty("NIKKEI_KAIRIRITSU");
var NIKKEI_KAIRIRITSU_SHEET_NAME = '日経乖離率';
var NIKKEI_KAIRIRITSU_URL = 'http://kabusensor.com/nk/';

function main() {
    const res = request(NIKKEI_KAIRIRITSU_URL);
    const items = getItems(res);
    const target =getTarget(items);
    const rate = getRate(target);
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

    for (var i = 0; i < length; ++i){
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
    for (var i = 0; i < length; ++i){
        string = string.replace(tags[i], '');
    }
    return string;
}

function getRate(html) {
    const tags = ['<li class="fs20 fbold mleft20">', '</li>'];
    const item = /<li class="fs20 fbold mleft20">.*?<\/li>/;
    const regexp = new RegExp(item);
    const string = html.match(regexp)[0];
    const rate = deleteTags(string, tags);
    return rate;
}

function getNikkeiKairiritsuSheet() {
    return SpreadsheetApp.openById(NIKKEI_KAIRIRITSU).getSheetByName(NIKKEI_KAIRIRITSU_SHEET_NAME);
}

function getTitles(sheet) {
    return sheet.getRange(1, 1, 1, 4).getValues();
}

function getToday() {
    const now = new Date();
    const year = now.getYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    return [[year, month, date]];
}

function setDate(sheet) {
    const lastRow = sheet.getLastRow();
    const lastColumn = sheet.getLastColumn();
    const today = getToday();
    sheet.getRange(lastRow + 1, 1, 1, 3).setValues(today);
}
