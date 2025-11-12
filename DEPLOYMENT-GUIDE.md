# Deployment Guide - Reach Stacker Monitoring System

## 📋 Overview

Sistem monitoring terdiri dari 3 komponen utama:

1. **ESP32 Hardware** - Sensor data collection
2. **Google Apps Script** - Data processing & storage
3. **React Dashboard** - Data visualization

---

## 🔧 Part 1: Google Apps Script Setup

### Step 1: Buka Google Sheets

1. Buka: https://docs.google.com/spreadsheets/d/1yU8Ob6_3s0LTMQXiCEipgxubqsNherQlUdRghWjZsCg/edit
2. Pastikan ada sheet: `RS-A`, `RS-B`, `RS-C`

### Step 2: Verify Apps Script

1. Klik **Extensions** > **Apps Script**
2. Pastikan kode sudah sesuai dengan Apps Script yang diberikan
3. Cek `SPREADSHEET_ID` sesuai dengan ID spreadsheet Anda

### Step 3: Deploy Web App

1. Di Apps Script editor, klik **Deploy** > **New deployment**
2. Pilih type: **Web app**
3. Settings:
   - Description: "Reach Stacker Monitor API"
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Klik **Deploy**
5. Copy Web App URL (akan seperti: `https://script.google.com/macros/s/.../exec`)
6. **Update URL ini di dashboard!**

### Step 4: Test API

Test dengan browser atau Postman:

```
GET https://script.google.com/macros/s/YOUR_ID/exec?id=RS-A
```

Expected response:

```json
{
  "status": "success",
  "reachStackerID": "RS-A",
  "data": [...]
}
```

---

## 💻 Part 2: Dashboard Setup

### Step 1: Install Dependencies

```bash
cd laporan-pekerjaan
npm install
```

### Step 2: Update Configuration

Edit `src/config.js`:

```javascript
export const config = {
  googleScriptUrl: "YOUR_ACTUAL_SCRIPT_URL_HERE",
  // ... rest of config
};
```

ATAU edit langsung di `src/ReachStackerDashboard.jsx`:

```javascript
const GOOGLE_SCRIPT_URL = "YOUR_ACTUAL_SCRIPT_URL_HERE";
```

### Step 3: Test Locally

```bash
npm run dev
```

Buka browser: `http://localhost:5173`

### Step 4: Build for Production

```bash
npm run build
```

Output ada di folder `dist/`

### Step 5: Deploy Dashboard

#### Option A: Vercel (Recommended)

1. Install Vercel CLI:

```bash
npm install -g vercel
```

2. Deploy:

```bash
vercel --prod
```

3. Follow prompts
4. Get deployed URL

#### Option B: Netlify

1. Install Netlify CLI:

```bash
npm install -g netlify-cli
```

2. Deploy:

```bash
netlify deploy --prod --dir=dist
```

#### Option C: GitHub Pages

1. Install gh-pages:

```bash
npm install --save-dev gh-pages
```

2. Update `package.json`:

```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://yourusername.github.io/repository-name"
}
```

3. Deploy:

```bash
npm run deploy
```

#### Option D: Self-hosted (VPS/Server)

1. Build project:

```bash
npm run build
```

2. Upload `dist/` folder to server

3. Configure web server (nginx example):

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

4. Restart nginx:

```bash
sudo systemctl restart nginx
```

---

## 🔌 Part 3: ESP32 Hardware Setup

### Hardware Requirements (per unit)

- ESP32 Development Board
- Temperature Sensor (DS18B20 or DHT22)
- Pressure Sensor (0-200 bar, 4-20mA output)
- Fuel Level Sensor (capacitive or resistive)
- Oil Level Sensor (float or ultrasonic)
- RPM Sensor (Hall effect or optical)
- Emergency Stop Button
- 12V/24V to 5V converter
- Project enclosure (IP65 rated)

### Wiring Diagram

```
ESP32 Pin Connections:
┌─────────────────────┐
│      ESP32          │
├─────────────────────┤
│ GPIO34 → Temp       │
│ GPIO35 → Pressure   │
│ GPIO32 → Oil Level  │
│ GPIO33 → Fuel Level │
│ GPIO25 → RPM        │
│ GPIO26 → E-Stop     │
│ GND    → Common GND │
│ 3V3    → Sensor VCC │
└─────────────────────┘
```

### Step 1: Install Arduino IDE

1. Download: https://www.arduino.cc/en/software
2. Install ESP32 board support:
   - File > Preferences
   - Additional Board URLs: `https://dl.espressif.com/dl/package_esp32_index.json`
   - Tools > Board > Boards Manager
   - Search "esp32" and install

### Step 2: Install Libraries

```
Tools > Manage Libraries > Install:
- WiFi (built-in)
- HTTPClient (built-in)
- ArduinoJson (by Benoit Blanchon)
```

For specific sensors:

- DS18B20: `DallasTemperature` and `OneWire`
- DHT22: `DHT sensor library`

### Step 3: Configure ESP32 Code

Edit `esp32/reach_stacker_monitor.ino`:

```cpp
// 1. WiFi Credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// 2. Google Script URL
const char* serverUrl = "YOUR_GOOGLE_SCRIPT_URL";

// 3. Unit ID (different for each unit)
const char* reachStackerID = "RS-A"; // or RS-B, RS-C
```

### Step 4: Upload Code

1. Connect ESP32 via USB
2. Select board: **ESP32 Dev Module**
3. Select port
4. Click **Upload**
5. Monitor serial output (9600 baud)

### Step 5: Test & Verify

1. Check serial monitor for:
   - WiFi connection success
   - Sensor readings
   - HTTP POST success
2. Verify data appears in Google Sheets
3. Check dashboard updates

### Step 6: Install in Vehicle

1. Mount ESP32 in weatherproof enclosure
2. Connect to vehicle 12V/24V power (with voltage regulator)
3. Route sensor cables properly
4. Secure all connections
5. Test system operation
6. Label unit clearly (RS-A/B/C)

---

## 🔍 Testing & Verification

### 1. Test Data Flow

```
ESP32 → Google Sheets → Dashboard
```

**Check 1:** ESP32 Serial Monitor

- Should show sensor readings
- Should show HTTP 200 response

**Check 2:** Google Sheets

- Open spreadsheet
- Check data appears in correct sheet (RS-A/B/C)
- Verify timestamp is correct (WIB)

**Check 3:** Dashboard

- Should show latest data
- Should update every 10 seconds
- Connection status should be "Connected"

### 2. Test Alert System

**Temperature Alert:**

- Simulate high temperature (>90°C)
- Check dashboard shows red color
- Verify notification appears (if enabled)

**Emergency Stop:**

- Activate emergency button
- Check "EMERGENCY STOP ACTIVE" appears
- Verify notification and sound alert

**Connection Lost:**

- Disconnect ESP32 or WiFi
- Wait 5 minutes
- Check "DISCONNECTED" status appears
- Verify notification

### 3. Multi-Unit Test

- Deploy 3 ESP32 units (RS-A, RS-B, RS-C)
- Verify all units send data independently
- Check dashboard can switch between units
- Verify all units overview works

---

## 📊 Monitoring & Maintenance

### Daily Checks

- [ ] All units showing "Connected" status
- [ ] Data updates regularly
- [ ] No critical alerts
- [ ] Dashboard accessible

### Weekly Checks

- [ ] Review alert history
- [ ] Check data trends
- [ ] Verify sensor calibration
- [ ] Test notification system

### Monthly Checks

- [ ] Review system performance
- [ ] Check Google Sheets storage
- [ ] Update firmware if needed
- [ ] Clean/service sensors

---

## 🐛 Troubleshooting

### Problem: Dashboard tidak menampilkan data

**Solution:**

1. Cek Google Apps Script URL sudah benar
2. Test API dengan browser
3. Cek CORS settings
4. Verify data ada di Google Sheets

### Problem: ESP32 tidak terkoneksi WiFi

**Solution:**

1. Cek SSID dan password
2. Cek jarak ke access point
3. Test dengan HP hotspot dulu
4. Monitor serial output untuk error

### Problem: Data tidak masuk Google Sheets

**Solution:**

1. Cek Google Script deployment settings
2. Verify "Anyone can access" enabled
3. Check Apps Script logs (View > Executions)
4. Test POST dengan Postman

### Problem: Notifikasi tidak muncul

**Solution:**

1. Enable notifications di browser
2. Klik bell icon di dashboard
3. Test dengan manual alert trigger
4. Check browser notification settings

### Problem: Sensor readings tidak akurat

**Solution:**

1. Kalibrasi sensor sesuai datasheet
2. Cek wiring connections
3. Test sensor independently
4. Update calibration constants in code

---

## 📱 Mobile Access

Dashboard fully responsive, dapat diakses via:

- Desktop browser
- Tablet
- Smartphone

Untuk best experience on mobile:

1. Add to Home Screen
2. Enable notifications
3. Use landscape mode untuk charts

---

## 🔒 Security Notes

### Google Apps Script

- ✅ Deployed as "Anyone can access" (required for ESP32 POST)
- ⚠️ No authentication (data is public)
- 📝 Consider adding API key for production

### WiFi Security

- Use WPA2/WPA3
- Create separate IoT network
- Use strong passwords
- Regularly update credentials

### Dashboard

- Deploy with HTTPS
- Consider adding login authentication
- Restrict access to internal network

---

## 📈 Scaling

### Adding More Units

1. Create new sheet in Google Sheets (e.g., RS-D)
2. Update `reachStackers` array in dashboard
3. Deploy new ESP32 with correct ID
4. No Apps Script changes needed

### Data Retention

Google Sheets limits:

- Max 10 million cells per spreadsheet
- Consider archiving old data monthly
- Use separate spreadsheet for historical data

---

## 📞 Support

For issues or questions:

1. Check this documentation
2. Review troubleshooting section
3. Check serial monitor logs
4. Review Apps Script execution logs
5. Contact IT support team

---

## ✅ Final Deployment Checklist

### Google Apps Script

- [ ] Script deployed as Web App
- [ ] "Anyone can access" enabled
- [ ] API endpoint tested
- [ ] URL documented

### Dashboard

- [ ] Dependencies installed
- [ ] Script URL updated
- [ ] Build successful
- [ ] Deployed to hosting
- [ ] Accessible via URL
- [ ] All units visible
- [ ] Notifications work

### ESP32 (per unit)

- [ ] Hardware assembled
- [ ] Sensors calibrated
- [ ] WiFi configured
- [ ] Script URL updated
- [ ] Unit ID set correctly
- [ ] Code uploaded
- [ ] Serial test passed
- [ ] Data appears in Sheets
- [ ] Installed in vehicle
- [ ] Power connected
- [ ] Weatherproof enclosure
- [ ] Unit labeled

### System Test

- [ ] All 3 units online
- [ ] Data updating every 10s
- [ ] Dashboard switching works
- [ ] Alerts functioning
- [ ] Notifications working
- [ ] Mobile access works
- [ ] Team trained on system

---

**System Status:** ✅ Ready for Production

**Deployment Date:** ****\_\_\_****

**Deployed By:** ****\_\_\_****

**Notes:** ****\_\_\_****
