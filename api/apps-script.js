// Google Apps Script untuk menerima data dari MULTIPLE ESP32
// Spreadsheet ID & default sheet ditentukan manual
// Deploy as Web App → Anyone can access

const SPREADSHEET_ID = "1yU8Ob6_3s0LTMQXiCEipgxubqsNherQlUdRghWjZsCg";

/**
 * Handle POST requests from ESP32
 * Receives sensor data and saves to appropriate sheet
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var reachStackerID = data.reachStackerID || 'UNKNOWN';
    
    // Ambil sheet berdasarkan Reach Stacker ID
    var sheet = getOrCreateSheet(reachStackerID);
    
    // Tambahkan timestamp (WIB)
    var timestamp = new Date();
    timestamp.setHours(timestamp.getHours() + 7);
    
    // Simpan data
    sheet.appendRow([
      timestamp,
      reachStackerID,
      data.temperature,
      data.pressure,
      data.hydraulicOil,
      data.fuelLevel,
      data.engineRPM,
      data.emergencyStop
    ]);
    
    Logger.log('Data received from ' + reachStackerID + ' at ' + timestamp);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data saved successfully for ' + reachStackerID,
      timestamp: timestamp.toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Handle GET requests from Dashboard
 * Returns data based on query parameter
 */
function doGet(e) {
  try {
    var reachStackerID = e.parameter.id || 'all';
    
    if (reachStackerID === 'all') {
      return getAllReachStackersData();
    } else if (reachStackerID === 'status') {
      return getConnectionStatus();
    } else {
      return getReachStackerData(reachStackerID);
    }
    
  } catch (error) {
    Logger.log('Error in doGet: ' + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Get connection status for all units
 * Returns whether each unit is connected, warning, or disconnected
 */
function getConnectionStatus() {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheets = spreadsheet.getSheets();
  var statusData = {};
  
  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var sheetName = sheet.getName();
    
    if (sheetName.indexOf('RS-') === 0) {
      var lastRow = sheet.getLastRow();
      if (lastRow > 1) {
        var lastTimestamp = sheet.getRange(lastRow, 1).getValue();
        var now = new Date();
        var diffMinutes = (now - new Date(lastTimestamp)) / (1000 * 60);
        
        var status = 'connected';
        if (diffMinutes > 5) status = 'disconnected';
        else if (diffMinutes > 1) status = 'warning';
        
        statusData[sheetName] = {
          status: status,
          lastSeen: lastTimestamp,
          minutesAgo: Math.round(diffMinutes)
        };
      } else {
        statusData[sheetName] = { status: 'no_data', lastSeen: null, minutesAgo: null };
      }
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    data: statusData
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get or create sheet for specific Reach Stacker ID
 * Creates new sheet with headers if it doesn't exist
 */
function getOrCreateSheet(reachStackerID) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(reachStackerID);
  
  if (!sheet) {
    // Kalau belum ada, buat sheet baru dari template "Sheet1"
    var baseSheet = spreadsheet.getSheetByName("Sheet1");
    if (baseSheet) {
      sheet = baseSheet.copyTo(spreadsheet);
      sheet.setName(reachStackerID);
    } else {
      sheet = spreadsheet.insertSheet(reachStackerID);
    }
    
    // Header kolom
    sheet.getRange(1, 1, 1, 8).setValues([[
      'Timestamp',
      'Reach Stacker ID',
      'Temperature (°C)',
      'Pressure (bar)',
      'Hydraulic Oil (%)',
      'Fuel Level (%)',
      'Engine RPM',
      'Emergency Stop'
    ]]);
    sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    sheet.getRange(1, 1, 1, 8).setBackground('#4285f4');
    sheet.getRange(1, 1, 1, 8).setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
  
  return sheet;
}

/**
 * Get data for specific Reach Stacker
 * Returns last 100 records
 */
function getReachStackerData(reachStackerID) {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = spreadsheet.getSheetByName(reachStackerID);
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Reach Stacker ' + reachStackerID + ' not found'
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var rows = data.slice(1);
  
  var jsonData = [];
  for (var i = 0; i < rows.length; i++) {
    var row = {};
    for (var j = 0; j < headers.length; j++) {
      row[headers[j]] = rows[i][j];
    }
    jsonData.push(row);
  }
  
  var latestData = jsonData.slice(-100);
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    reachStackerID: reachStackerID,
    data: latestData
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Get data for all Reach Stackers
 * Returns last 100 records for each unit
 */
function getAllReachStackersData() {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheets = spreadsheet.getSheets();
  var allData = {};
  
  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var name = sheet.getName();
    if (name.indexOf('RS-') === 0) {
      var data = sheet.getDataRange().getValues();
      var headers = data[0];
      var rows = data.slice(1);
      
      var jsonData = [];
      for (var j = 0; j < rows.length; j++) {
        var row = {};
        for (var k = 0; k < headers.length; k++) {
          row[headers[k]] = rows[j][k];
        }
        jsonData.push(row);
      }
      
      allData[name] = jsonData.slice(-100);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    data: allData
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Setup all sheets for Reach Stackers
 * Run this once to create all required sheets
 */
function setupAllSheets() {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var reachStackers = ['RS-A', 'RS-B', 'RS-C'];
  
  for (var i = 0; i < reachStackers.length; i++) {
    getOrCreateSheet(reachStackers[i]);
  }
  
  Logger.log('All sheets setup complete');
}

/**
 * Get list of available Reach Stackers
 * Returns array of sheet names that start with 'RS-'
 */
function getAvailableReachStackers() {
  var spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheets = spreadsheet.getSheets();
  var list = [];
  
  for (var i = 0; i < sheets.length; i++) {
    var name = sheets[i].getName();
    if (name.indexOf('RS-') === 0) list.push(name);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    status: 'success',
    reachStackers: list
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * DEPLOYMENT INSTRUCTIONS:
 * 
 * 1. Open Google Sheets with your data
 * 2. Extensions > Apps Script
 * 3. Paste this code
 * 4. Save with name "Reach Stacker Monitor API"
 * 5. Deploy > New deployment
 * 6. Select type: Web app
 * 7. Execute as: Me
 * 8. Who has access: Anyone
 * 9. Deploy
 * 10. Copy Web App URL
 * 11. Update URL in:
 *     - ESP32 code (serverUrl variable)
 *     - Dashboard code (GOOGLE_SCRIPT_URL constant)
 *     - test-sender.html (SCRIPT_URL constant)
 * 
 * API ENDPOINTS:
 * 
 * GET  ?id=RS-A     - Get data for RS-A
 * GET  ?id=RS-B     - Get data for RS-B
 * GET  ?id=RS-C     - Get data for RS-C
 * GET  ?id=all      - Get data for all units
 * GET  ?id=status   - Get connection status
 * POST (body: JSON) - Save sensor data
 * 
 * TESTING:
 * 
 * Test with browser:
 * https://script.google.com/macros/s/YOUR_ID/exec?id=RS-A
 * 
 * Test with curl:
 * curl -X POST YOUR_URL \
 *   -H "Content-Type: application/json" \
 *   -d '{"reachStackerID":"RS-A","temperature":75.5,...}'
 */
