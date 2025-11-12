# Quick Start Guide - Reach Stacker Monitor

## 🚀 Get Started in 5 Minutes

### 1. Test Dashboard Sekarang

```bash
npm install
npm run dev
```

Buka: http://localhost:5174

### 2. Test dengan Dummy Data

Buka file `test-sender.html` di browser:

- Pilih unit (RS-A/B/C)
- Set sensor values
- Klik "Send Data"
- Lihat dashboard update

### 3. Aktifkan Notifikasi

- Klik icon 🔔 di dashboard
- Allow notifications
- Test dengan set values ke DANGER preset

---

## 📝 Common Tasks

### Mengganti Google Script URL

**File:** `src/ReachStackerDashboard.jsx`

```javascript
const GOOGLE_SCRIPT_URL = "YOUR_NEW_URL_HERE";
```

### Build untuk Production

```bash
npm run build
```

Hasil ada di folder `dist/`

### Test API Endpoint

Buka di browser:

```
https://script.google.com/.../exec?id=RS-A
```

### Kirim Test Data via Postman

```
POST: https://script.google.com/.../exec
Content-Type: application/json

{
  "reachStackerID": "RS-A",
  "temperature": 75.5,
  "pressure": 120.3,
  "hydraulicOil": 85.2,
  "fuelLevel": 67.8,
  "engineRPM": 1800,
  "emergencyStop": 0
}
```

---

## 🔧 ESP32 Quick Setup

### 1. Install Arduino IDE

Download: https://www.arduino.cc/en/software

### 2. Install ESP32 Support

- File > Preferences
- Additional URLs: `https://dl.espressif.com/dl/package_esp32_index.json`
- Tools > Board Manager > Install "esp32"

### 3. Install Libraries

- ArduinoJson
- WiFi (built-in)
- HTTPClient (built-in)

### 4. Configure & Upload

File: `esp32/reach_stacker_monitor.ino`

```cpp
// Update these:
const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";
const char* serverUrl = "YOUR_GOOGLE_SCRIPT_URL";
const char* reachStackerID = "RS-A"; // or RS-B, RS-C
```

Upload → Monitor Serial (115200 baud)

---

## 📊 Dashboard Features

### Multi-Unit Switching

- Klik menu icon (☰)
- Pilih RS-A, RS-B, atau RS-C
- Dashboard update otomatis

### View Charts

- Temperature & Pressure
- Oil & Fuel Levels
- Engine RPM History

### Enable Alerts

1. Klik bell icon 🔔
2. Allow browser notifications
3. Alerts akan muncul untuk:
   - Temperature > 90°C
   - Pressure > 150 bar
   - Oil < 30%
   - Fuel < 20%
   - Emergency Stop

### Connection Status

- 🟢 Connected - Update < 1 min ago
- 🟡 Slow - Update 1-5 min ago
- 🔴 Disconnected - No update > 5 min

---

## 🎯 Status Thresholds

| Parameter | 🟢 Normal | 🟡 Warning  | 🔴 Danger |
| --------- | --------- | ----------- | --------- |
| Temp      | < 80°C    | 80-90°C     | > 90°C    |
| Press     | < 130 bar | 130-150 bar | > 150 bar |
| Oil       | > 50%     | 30-50%      | < 30%     |
| Fuel      | > 40%     | 20-40%      | < 20%     |

---

## 🐛 Quick Troubleshooting

### Dashboard tidak update?

```bash
# 1. Cek API endpoint
# Buka di browser:
https://script.google.com/.../exec?id=RS-A

# 2. Cek console browser
F12 → Console → Lihat errors

# 3. Refresh dashboard
Ctrl+R atau klik refresh button
```

### ESP32 tidak kirim data?

```
1. Cek serial monitor (115200 baud)
2. Verify WiFi connected
3. Test Google Script URL di browser
4. Cek JSON payload valid
```

### Notifikasi tidak muncul?

```
1. Klik bell icon 🔔
2. Allow di browser prompt
3. Check browser settings:
   chrome://settings/content/notifications
```

---

## 📚 Full Documentation

- **Dashboard Guide:** [README-DASHBOARD.md](./README-DASHBOARD.md)
- **Deployment:** [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)
- **Main README:** [README.md](./README.md)

---

## 🔗 Important URLs

**Google Sheets:**
https://docs.google.com/spreadsheets/d/1yU8Ob6_3s0LTMQXiCEipgxubqsNherQlUdRghWjZsCg/edit

**Apps Script API:**
https://script.google.com/macros/s/AKfycbxWR6P0gby8gHFRFCPJIE3I85VAR3z45rCJ7FPhPdwqGoyNu9kyRKB2GMw_JS05FBm4gA/exec

---

## 💡 Pro Tips

1. **Auto-send Testing:** Use `test-sender.html` with "Auto Send" button
2. **Keyboard Shortcuts:**
   - `Ctrl+Enter` = Send data
   - `Ctrl+Space` = Toggle auto
   - `Ctrl+R` = Randomize values
3. **Mobile:** Add dashboard to home screen for quick access
4. **Alerts:** Keep notifications enabled for critical events
5. **Monitoring:** Check all units overview card regularly

---

## ✅ Quick Checklist

Before going live:

- [ ] Google Script deployed and tested
- [ ] Dashboard shows all 3 units
- [ ] ESP32 units configured (RS-A, B, C)
- [ ] WiFi credentials correct
- [ ] Sensors calibrated
- [ ] Notifications enabled
- [ ] Team trained on system

---

**Need Help?** Check full documentation or contact IT support.

**System Status:** ✅ Production Ready
