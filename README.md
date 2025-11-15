# 🚨 Reach Stacker Monitoring System

Sistem monitoring real-time untuk 3 unit Reach Stacker yang terintegrasi dengan Google Sheets dan IoT sensors (ESP32).

## 📋 Project Overview

Sistem ini terdiri dari 3 komponen utama:

1. **ESP32 IoT Sensors** - Mengumpulkan data sensor dari Reach Stacker
2. **Google Apps Script** - Backend API dan data storage
3. **React Dashboard** - Frontend visualization dan monitoring

## 🎯 Fitur Utama

### Dashboard Features

- ✅ Real-time monitoring untuk 3 unit (RS-A, RS-B, RS-C)
- 📊 Live charts untuk temperature, pressure, oil, fuel, dan RPM
- 🚨 Emergency stop detection dan alerts
- 🔔 Browser notifications untuk critical events
- 📡 Connection status monitoring
- 📱 Responsive design (desktop, tablet, mobile)
- 🔄 Auto-refresh setiap 10 detik

### Sensor Monitoring

- 🌡️ **Temperature** - Engine temperature (°C)
- ⚙️ **Pressure** - Hydraulic pressure (bar)
- 🛢️ **Hydraulic Oil** - Oil level (%)
- ⛽ **Fuel Level** - Fuel tank level (%)
- 🔄 **Engine RPM** - Engine rotation speed
- 🚨 **Emergency Stop** - Emergency button status

### Alert System

- Critical temperature (>90°C)
- Critical pressure (>150 bar)
- Low hydraulic oil (<30%)
- Low fuel level (<20%)
- Emergency stop activation
- Connection lost detection

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Access Dashboard

```
http://localhost:5173
```
## 🧪 Testing

### Test dengan HTML Tool

1. Buka `test-sender.html` di browser
2. Pilih unit (RS-A/B/C)
3. Adjust sensor values
4. Klik "Send Data"
5. Cek data muncul di dashboard

## 📱 Browser Compatibility

- ✅ Chrome (Recommended)
- ✅ Firefox
- ✅ Edge
- ✅ Safari
- ⚠️ IE11 (Not supported)

## 🔔 Notification Support

Notifications supported on:

- Desktop browsers (Chrome, Firefox, Edge)
- Android Chrome
- macOS Safari

## 🏗️ Build for Production

```bash
npm run build
```

Output akan ada di folder `dist/`

## 📚 Documentation

- [Dashboard Documentation](./README-DASHBOARD.md) - Lengkap tentang fitur dashboard
- [Deployment Guide](./DEPLOYMENT-GUIDE.md) - Step-by-step deployment
- [ESP32 Setup](./esp32/) - Hardware dan Arduino code

## 🛠️ Tech Stack

### Frontend

- React 18
- Tailwind CSS
- Recharts (untuk charts)
- Lucide React (icons)
- Vite (build tool)

### Backend

- Google Apps Script
- Google Sheets (database)

### Hardware

- ESP32 Development Board
- Temperature Sensor
- Pressure Sensor
- Oil/Fuel Level Sensors
- RPM Sensor
- Emergency Stop Button

## 📊 API Endpoints

### Get Data Unit Tertentu

```
GET {SCRIPT_URL}?id=RS-A
```

### Get All Units Data

```
GET {SCRIPT_URL}?id=all
```

### Get Connection Status

```
GET {SCRIPT_URL}?id=status
```

### Post Sensor Data (dari ESP32)

```
POST {SCRIPT_URL}
Content-Type: application/json

{
  "reachStackerID": "RS-A",
  "temperature": 75.5,
  ...
}
```

## ⚙️ Sensor Thresholds

| Sensor        | Normal   | Warning     | Danger   |
| ------------- | -------- | ----------- | -------- |
| Temperature   | <80°C    | 80-90°C     | >90°C    |
| Pressure      | <130 bar | 130-150 bar | >150 bar |
| Hydraulic Oil | >50%     | 30-50%      | <30%     |
| Fuel Level    | >40%     | 20-40%      | <20%     |

## 👨‍💻 Development Team

Created for industrial Reach Stacker monitoring system.

## 📝 License

MIT License - Free to use and modify

## 🔄 Updates

**Version 1.0.0** (Current)

- ✅ Real-time monitoring untuk 3 units
- ✅ Google Sheets integration
- ✅ Browser notifications
- ✅ Emergency alerts
- ✅ Connection status monitoring
- ✅ Responsive design
- ✅ ESP32 integration code

## 🎯 Roadmap

Future improvements:

- [ ] Historical data analysis
- [ ] PDF report generation
- [ ] SMS alerts
- [ ] Maintenance scheduling
- [ ] User authentication
- [ ] Multi-language support

---

**System Status:** ✅ Production Ready

**Last Updated:** November 2025

**Deployed By:** IT Team

For detailed setup instructions, see [DEPLOYMENT-GUIDE.md](./DEPLOYMENT-GUIDE.md)

```

```
