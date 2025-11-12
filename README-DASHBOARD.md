# Reach Stacker Monitoring Dashboard

Dashboard monitoring real-time untuk 3 unit Reach Stacker (RS-A, RS-B, RS-C) yang terintegrasi dengan Google Sheets melalui Google Apps Script.

## 🚀 Fitur Utama

### 1. **Monitoring Real-time**
- Update otomatis setiap 10 detik
- Data langsung dari Google Sheets
- Status koneksi untuk setiap unit

### 2. **Multi-Unit Support**
- RS-A (Reach Stacker A) - Biru
- RS-B (Reach Stacker B) - Ungu
- RS-C (Reach Stacker C) - Hijau
- Switching antar unit dengan mudah

### 3. **Sensor Monitoring**
- **Temperature (°C)** - Suhu engine
- **Pressure (bar)** - Tekanan hydraulic
- **Hydraulic Oil (%)** - Level oli hydraulic
- **Fuel Level (%)** - Level bahan bakar
- **Engine RPM** - Putaran mesin
- **Emergency Stop** - Status emergency

### 4. **Visual Charts**
- Temperature & Pressure History
- Oil & Fuel Levels
- Engine RPM History
- 20 data points terakhir

### 5. **Alert System**
- 🚨 Emergency Stop Alert
- 🌡️ Critical Temperature (>90°C)
- ⚠️ Critical Pressure (>150 bar)
- 🛢️ Low Hydraulic Oil (<30%)
- ⛽ Low Fuel Level (<20%)
- 📡 Connection Lost Alert

### 6. **Notification System**
- Browser notifications untuk critical alerts
- Alert sound untuk emergency
- Real-time notification status

### 7. **Connection Status**
- **Connected** - Update dalam 1 menit terakhir (hijau)
- **Slow** - Update 1-5 menit lalu (kuning)
- **Disconnected** - Tidak ada update >5 menit (merah)

## 📋 Prerequisites

- Node.js v16 atau lebih baru
- npm atau yarn
- Browser modern (Chrome, Firefox, Edge)
- Google Sheets dengan Apps Script aktif

## 🔧 Instalasi

1. **Clone repository**
```bash
git clone <repository-url>
cd laporan-pekerjaan
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Buka di browser**
```
http://localhost:5173
```

## 📊 Google Sheets Integration

### Google Spreadsheet
**URL:** https://docs.google.com/spreadsheets/d/1yU8Ob6_3s0LTMQXiCEipgxubqsNherQlUdRghWjZsCg/edit

### Apps Script URL
**Endpoint:** https://script.google.com/macros/s/AKfycbwQISoKcQ2iHnCc_LCveKKDBgRmTE-8TnM1DhDHpB9iqnsnsxnQjaiIV5zsXiA_tqBZxQ/exec

### Sheet Structure
Setiap unit memiliki sheet sendiri (RS-A, RS-B, RS-C) dengan kolom:
- Timestamp
- Reach Stacker ID
- Temperature (°C)
- Pressure (bar)
- Hydraulic Oil (%)
- Fuel Level (%)
- Engine RPM
- Emergency Stop

## 🔌 API Endpoints

### 1. Get Data untuk Unit Tertentu
```
GET {SCRIPT_URL}?id=RS-A
```
Response:
```json
{
  "status": "success",
  "reachStackerID": "RS-A",
  "data": [...]
}
```

### 2. Get Data Semua Unit
```
GET {SCRIPT_URL}?id=all
```

### 3. Get Connection Status
```
GET {SCRIPT_URL}?id=status
```

### 4. Post Data dari ESP32
```
POST {SCRIPT_URL}
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

## 🎨 Status Colors

### Temperature
- 🟢 Normal: < 80°C
- 🟡 Warning: 80-90°C
- 🔴 Danger: > 90°C

### Pressure
- 🟢 Normal: < 130 bar
- 🟡 Warning: 130-150 bar
- 🔴 Danger: > 150 bar

### Hydraulic Oil
- 🟢 Normal: > 50%
- 🟡 Warning: 30-50%
- 🔴 Danger: < 30%

### Fuel Level
- 🟢 Normal: > 40%
- 🟡 Warning: 20-40%
- 🔴 Danger: < 20%

## 🔔 Notification Settings

1. Klik tombol Bell icon di header
2. Allow browser notifications
3. Notifikasi akan muncul untuk:
   - Emergency stop activation
   - Critical temperature/pressure
   - Low oil/fuel levels
   - Connection lost

## 🛠️ Development

### Tech Stack
- **Frontend:** React 18
- **UI Framework:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React
- **Build Tool:** Vite

### Project Structure
```
src/
├── ReachStackerDashboard.jsx  # Main dashboard component
├── main.jsx                    # Entry point
├── index.css                   # Global styles
└── App.jsx                     # Original app (backup)
```

### Build for Production
```bash
npm run build
```

Output akan ada di folder `dist/`

## 📱 Responsive Design

Dashboard responsive untuk:
- Desktop (>1024px)
- Tablet (768-1024px)
- Mobile (320-768px)

## 🐛 Troubleshooting

### Data tidak muncul
1. Cek koneksi internet
2. Pastikan Google Apps Script sudah deployed
3. Cek console browser untuk error
4. Pastikan CORS enabled di Apps Script

### Notifikasi tidak muncul
1. Allow notification di browser settings
2. Klik tombol Bell untuk request permission
3. Test dengan kondisi emergency

### Connection status selalu disconnected
1. Cek timestamp data di Google Sheets
2. Pastikan data ter-update dalam 5 menit terakhir
3. Cek timezone WIB di Apps Script

## 📝 License

MIT License - feel free to use for your projects

## 👨‍💻 Author

Created for Reach Stacker monitoring system

## 🙏 Support

Untuk pertanyaan dan support, hubungi tim IT.
