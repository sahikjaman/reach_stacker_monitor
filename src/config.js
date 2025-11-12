// Configuration for Reach Stacker Dashboard

export const config = {
  // Google Apps Script Web App URL
  googleScriptUrl:
    "https://script.google.com/macros/s/AKfycbxWR6P0gby8gHFRFCPJIE3I85VAR3z45rCJ7FPhPdwqGoyNu9kyRKB2GMw_JS05FBm4gA/exec",

  // Google Spreadsheet URL (for reference)
  spreadsheetUrl:
    "https://docs.google.com/spreadsheets/d/1yU8Ob6_3s0LTMQXiCEipgxubqsNherQlUdRghWjZsCg/edit",

  // Refresh interval (milliseconds)
  refreshInterval: 1000, // 1 detik

  // Connection timeout thresholds (seconds)
  connectionThresholds: {
    disconnected: 5, // Mark as disconnected if no update in 5 seconds
  },

  // Sensor thresholds
  thresholds: {
    temperature: {
      warning: 80, // °C
      danger: 90, // °C
    },
    pressure: {
      warning: 130, // bar
      danger: 150, // bar
    },
    hydraulicOil: {
      warning: 50, // %
      danger: 30, // %
    },
    fuelLevel: {
      warning: 40, // %
      danger: 20, // %
    },
  },

  // Reach Stacker units configuration
  units: [
    { id: "RS-A", name: "Reach Stacker A", color: "bg-blue-500" },
    { id: "RS-B", name: "Reach Stacker B", color: "bg-purple-500" },
    { id: "RS-C", name: "Reach Stacker C", color: "bg-green-500" },
  ],

  // Chart configuration
  chart: {
    maxDataPoints: 20, // Number of data points to show in charts
    animationDuration: 300,
  },
};

export default config;
