function request(url) {
    var request = UrlFetchApp.fetch(url);
    return request.getContentText('UTF-8').replace(/\r?\n/g, '');
}

function getSheet(sheetId) {
    return SpreadsheetApp.openById(sheetId);
}
