var BITCOIN_CHART_SHEET_ID = PropertiesService.getScriptProperties().getProperty("BITCOIN_CHART_SHEET_ID");
var bitcoinSheetID = SpreadsheetApp.openById(BITCOIN_CHART_SHEET_ID);

var ExchangeName = {
  Bitflyer: "bitflyer",
  Zaif: "zaif",
  Coincheck: "coincheck",
}

var bitcoinSpreadsheet = SpreadsheetApp.openById(BITCOIN_CHART_SHEET_ID);

var bitcoinSheet = {
  Bitflyer: bitcoinSpreadsheetgetSheetByName(ExchangeName.Bitflyer),
  Zaif: bitcoinSpreadsheetgetSheetByName(ExchangeName.Zaif),
  Coincheck: bitcoinSpreadsheetgetSheetByName(ExchangeName.Coincheck),
}



