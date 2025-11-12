import React, { useState, useEffect } from 'react';
import { Activity, Thermometer, Gauge, Droplet, Fuel, AlertTriangle, RefreshCw, Menu, X, Bell, BellOff } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const ReachStackerDashboard = () => {
  const [data, setData] = useState([]);
  const [latestData, setLatestData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [selectedRS, setSelectedRS] = useState('RS-A');
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [previousEmergencyState, setPreviousEmergencyState] = useState({});
  const [connectionStatus, setConnectionStatus] = useState({});
  const [allUnitsData, setAllUnitsData] = useState({});
  
  const reachStackers = [
    { id: 'RS-A', name: 'Reach Stacker A', color: 'bg-blue-500' },
    { id: 'RS-B', name: 'Reach Stacker B', color: 'bg-purple-500' },
    { id: 'RS-C', name: 'Reach Stacker C', color: 'bg-green-500' }
  ];
  
  // URL Google Apps Script
  const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwQISoKcQ2iHnCc_LCveKKDBgRmTE-8TnM1DhDHpB9iqnsnsxnQjaiIV5zsXiA_tqBZxQ/exec';

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
        showNotification('Notifikasi Diaktifkan', 'Anda akan menerima alert emergency', 'success');
      }
    }
  };

  // Show notification
  const showNotification = (title, body, type = 'emergency') => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const icon = type === 'emergency' ? '🚨' : type === 'warning' ? '⚠️' : '✅';
      
      new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: `reach-stacker-${selectedRS}`,
        requireInteraction: type === 'emergency',
        vibrate: type === 'emergency' ? [200, 100, 200] : [100]
      });

      // Play sound for emergency
      if (type === 'emergency') {
        playAlertSound();
      }
    }
  };

  // Play alert sound
  const playAlertSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Error playing sound:', error);
    }
  };

  const fetchData = async (reachStackerID) => {
    try {
      setLoading(true);
      const response = await fetch(`${GOOGLE_SCRIPT_URL}?id=${reachStackerID}`);
      const result = await response.json();
      
      if (result.status === 'success') {
        const formattedData = result.data.map(item => ({
          timestamp: new Date(item.Timestamp).toLocaleTimeString('id-ID', { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit'
          }),
          fullTimestamp: new Date(item.Timestamp),
          temperature: parseFloat(item['Temperature (°C)']) || 0,
          pressure: parseFloat(item['Pressure (bar)']) || 0,
          hydraulicOil: parseFloat(item['Hydraulic Oil (%)']) || 0,
          fuelLevel: parseFloat(item['Fuel Level (%)']) || 0,
          engineRPM: parseInt(item['Engine RPM']) || 0,
          emergencyStop: item['Emergency Stop'] || 0
        }));
        
        setData(formattedData);
        const latest = formattedData[formattedData.length - 1];
        setLatestData(latest);
        setLastUpdate(new Date());

        // Update connection status
        checkConnectionStatus(reachStackerID, latest);

        // Check for emergency state change
        if (notificationsEnabled && latest) {
          checkEmergencyState(reachStackerID, latest);
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      // Mark as disconnected on error
      setConnectionStatus(prev => ({
        ...prev,
        [reachStackerID]: {
          status: 'disconnected',
          lastSeen: prev[reachStackerID]?.lastSeen || null
        }
      }));
    } finally {
      setLoading(false);
    }
  };

  // Check all units connection status
  const fetchAllUnitsStatus = async () => {
    for (const rs of reachStackers) {
      try {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?id=${rs.id}`);
        const result = await response.json();
        
        if (result.status === 'success' && result.data.length > 0) {
          const latestRecord = result.data[result.data.length - 1];
          const lastTimestamp = new Date(latestRecord.Timestamp);
          
          setAllUnitsData(prev => ({
            ...prev,
            [rs.id]: {
              lastData: latestRecord,
              lastTimestamp: lastTimestamp
            }
          }));

          checkConnectionStatus(rs.id, { fullTimestamp: lastTimestamp });
        }
      } catch (error) {
        console.error(`Error fetching ${rs.id}:`, error);
      }
    }
  };

  const checkConnectionStatus = (rsID, latest) => {
    if (!latest || !latest.fullTimestamp) return;

    const now = new Date();
    const lastUpdate = new Date(latest.fullTimestamp);
    const diffMinutes = (now - lastUpdate) / (1000 * 60);

    let status = 'connected';
    if (diffMinutes > 5) {
      status = 'disconnected';
    } else if (diffMinutes > 1) {
      status = 'warning';
    }

    setConnectionStatus(prev => {
      const prevStatus = prev[rsID]?.status;
      
      // Send notification if status changed to disconnected
      if (prevStatus === 'connected' && status === 'disconnected' && notificationsEnabled) {
        showNotification(
          `📡 Connection Lost - ${rsID}`,
          `Unit ${rsID} telah terputus dari sistem`,
          'warning'
        );
      }

      return {
        ...prev,
        [rsID]: {
          status: status,
          lastSeen: lastUpdate
        }
      };
    });
  };

  const checkEmergencyState = (rsID, latest) => {
    const currentEmergency = latest.emergencyStop === 1;
    const previousEmergency = previousEmergencyState[rsID] || false;

    // Emergency stop activated
    if (currentEmergency && !previousEmergency) {
      showNotification(
        `🚨 EMERGENCY STOP - ${rsID}`,
        `Unit ${rsID} telah mengaktifkan emergency stop!`,
        'emergency'
      );
    }

    // Critical temperature
    if (latest.temperature > 90) {
      showNotification(
        `🌡️ Temperature Critical - ${rsID}`,
        `Temperature: ${latest.temperature.toFixed(1)}°C (Critical!)`,
        'emergency'
      );
    }

    // Critical pressure
    if (latest.pressure > 150) {
      showNotification(
        `⚠️ Pressure Critical - ${rsID}`,
        `Pressure: ${latest.pressure.toFixed(1)} bar (Critical!)`,
        'emergency'
      );
    }

    // Low oil warning
    if (latest.hydraulicOil < 30) {
      showNotification(
        `🛢️ Low Oil Level - ${rsID}`,
        `Hydraulic Oil: ${latest.hydraulicOil.toFixed(1)}% (Critical!)`,
        'warning'
      );
    }

    // Low fuel warning
    if (latest.fuelLevel < 20) {
      showNotification(
        `⛽ Low Fuel - ${rsID}`,
        `Fuel Level: ${latest.fuelLevel.toFixed(1)}% (Critical!)`,
        'warning'
      );
    }

    setPreviousEmergencyState(prev => ({
      ...prev,
      [rsID]: currentEmergency
    }));
  };

  useEffect(() => {
    fetchData(selectedRS);
    fetchAllUnitsStatus();
    
    const interval = setInterval(() => {
      fetchData(selectedRS);
      fetchAllUnitsStatus();
    }, 10000); // Refresh setiap 10 detik
    
    return () => clearInterval(interval);
  }, [selectedRS, notificationsEnabled]);

  const SensorCard = ({ icon: Icon, title, value, unit, status }) => (
    <div className="bg-white rounded-xl shadow-md p-5 border-l-4 transition-all hover:shadow-lg" style={{
      borderLeftColor: status === 'danger' ? '#ef4444' : status === 'warning' ? '#f59e0b' : '#10b981'
    }}>
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${
          status === 'danger' ? 'bg-red-100' : 
          status === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
        }`}>
          <Icon className={`w-5 h-5 ${
            status === 'danger' ? 'text-red-500' : 
            status === 'warning' ? 'text-yellow-500' : 'text-green-500'
          }`} />
        </div>
        <p className="text-gray-500 text-xs font-medium uppercase">{title}</p>
      </div>
      <div className="flex items-baseline gap-2">
        <span className={`text-3xl font-bold ${
          status === 'danger' ? 'text-red-500' : 
          status === 'warning' ? 'text-yellow-500' : 'text-green-500'
        }`}>
          {value}
        </span>
        <span className="text-gray-400 text-sm">{unit}</span>
      </div>
    </div>
  );

  const getStatus = (temp, pressure, oil, fuel) => {
    if (temp > 90 || pressure > 150 || oil < 30 || fuel < 20) return 'danger';
    if (temp > 80 || pressure > 130 || oil < 50 || fuel < 40) return 'warning';
    return 'normal';
  };

  const currentStatus = latestData ? getStatus(
    latestData.temperature,
    latestData.pressure,
    latestData.hydraulicOil,
    latestData.fuelLevel
  ) : 'normal';

  const currentRS = reachStackers.find(rs => rs.id === selectedRS);
  const currentConnection = connectionStatus[selectedRS] || { status: 'connecting' };

  const getConnectionBadge = (rsID) => {
    const conn = connectionStatus[rsID] || { status: 'connecting' };
    
    if (conn.status === 'connected') {
      return {
        color: 'bg-green-500',
        text: 'Connected',
        icon: '●',
        pulse: true
      };
    } else if (conn.status === 'warning') {
      return {
        color: 'bg-yellow-500',
        text: 'Slow',
        icon: '●',
        pulse: true
      };
    } else if (conn.status === 'disconnected') {
      return {
        color: 'bg-red-500',
        text: 'Disconnected',
        icon: '○',
        pulse: false
      };
    } else {
      return {
        color: 'bg-gray-400',
        text: 'Connecting',
        icon: '◐',
        pulse: true
      };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                <Gauge className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Reach Stacker Monitor</h1>
                <p className="text-xs text-gray-500">Real-time Monitoring System</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notification Toggle */}
              <button
                onClick={() => {
                  if (!notificationsEnabled) {
                    requestNotificationPermission();
                  } else {
                    setNotificationsEnabled(false);
                  }
                }}
                className={`p-2 rounded-lg transition-all ${
                  notificationsEnabled 
                    ? 'bg-green-100 text-green-600 hover:bg-green-200' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
                title={notificationsEnabled ? 'Notifikasi Aktif' : 'Aktifkan Notifikasi'}
              >
                {notificationsEnabled ? <Bell className="w-5 h-5" /> : <BellOff className="w-5 h-5" />}
              </button>

              {/* Refresh Button */}
              <button
                onClick={() => fetchData(selectedRS)}
                className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-all"
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              </button>

              {/* Menu Button */}
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-all"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div className="absolute right-4 top-20 w-72 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
            <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800">
              <p className="text-white text-sm font-medium">Pilih Unit</p>
              <p className="text-blue-100 text-xs mt-1">Status Koneksi Real-time</p>
            </div>
            <div className="p-2">
              {reachStackers.map((rs) => {
                const badge = getConnectionBadge(rs.id);
                return (
                  <button
                    key={rs.id}
                    onClick={() => {
                      setSelectedRS(rs.id);
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all mb-1 ${
                      selectedRS === rs.id
                        ? 'bg-blue-50 border-2 border-blue-500'
                        : 'hover:bg-gray-50 border-2 border-transparent'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${rs.color}`}></div>
                    <div className="flex-1 text-left">
                      <span className={`font-medium block ${
                        selectedRS === rs.id ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {rs.name}
                      </span>
                      <div className="flex items-center gap-1 mt-1">
                        <span className={`w-2 h-2 rounded-full ${badge.color} ${badge.pulse ? 'animate-pulse' : ''}`}></span>
                        <span className="text-xs text-gray-500">{badge.text}</span>
                      </div>
                    </div>
                    {selectedRS === rs.id && (
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </nav>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Current Unit Display */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-4 h-4 rounded-full ${currentRS?.color} ${currentConnection.status === 'connected' ? 'animate-pulse' : ''}`}></div>
              <div>
                <p className="text-sm text-gray-500">Monitoring Unit</p>
                <h2 className="text-2xl font-bold text-gray-800">{currentRS?.name}</h2>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connection Status Badge */}
              <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                currentConnection.status === 'connected' ? 'bg-green-100' :
                currentConnection.status === 'warning' ? 'bg-yellow-100' :
                currentConnection.status === 'disconnected' ? 'bg-red-100' : 'bg-gray-100'
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  currentConnection.status === 'connected' ? 'bg-green-500 animate-pulse' :
                  currentConnection.status === 'warning' ? 'bg-yellow-500 animate-pulse' :
                  currentConnection.status === 'disconnected' ? 'bg-red-500' : 'bg-gray-400 animate-spin'
                }`}></div>
                <div className="text-left">
                  <p className={`text-xs font-semibold ${
                    currentConnection.status === 'connected' ? 'text-green-700' :
                    currentConnection.status === 'warning' ? 'text-yellow-700' :
                    currentConnection.status === 'disconnected' ? 'text-red-700' : 'text-gray-700'
                  }`}>
                    {currentConnection.status === 'connected' ? 'CONNECTED' :
                     currentConnection.status === 'warning' ? 'SLOW CONNECTION' :
                     currentConnection.status === 'disconnected' ? 'DISCONNECTED' : 'CONNECTING...'}
                  </p>
                  {currentConnection.lastSeen && (
                    <p className="text-xs text-gray-500">
                      {currentConnection.status === 'disconnected' ? 'Last seen: ' : 'Active'}
                      {currentConnection.status === 'disconnected' && 
                        currentConnection.lastSeen.toLocaleTimeString('id-ID')}
                    </p>
                  )}
                </div>
              </div>

              {lastUpdate && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Last Update</p>
                  <p className="text-sm font-semibold text-gray-700">
                    {lastUpdate.toLocaleTimeString('id-ID')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* All Units Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {reachStackers.map((rs) => {
            const badge = getConnectionBadge(rs.id);
            const unitData = allUnitsData[rs.id];
            return (
              <div
                key={rs.id}
                onClick={() => setSelectedRS(rs.id)}
                className={`bg-white rounded-xl shadow-md p-4 cursor-pointer transition-all hover:shadow-lg ${
                  selectedRS === rs.id ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${rs.color}`}></div>
                    <h3 className="font-bold text-gray-800 text-sm">{rs.name}</h3>
                  </div>
                  <div className={`px-2 py-1 rounded-full flex items-center gap-1 ${
                    badge.status === 'connected' ? 'bg-green-100' :
                    badge.status === 'warning' ? 'bg-yellow-100' :
                    badge.status === 'disconnected' ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${badge.color} ${badge.pulse ? 'animate-pulse' : ''}`}></span>
                    <span className={`text-xs font-semibold ${
                      badge.status === 'connected' ? 'text-green-700' :
                      badge.status === 'warning' ? 'text-yellow-700' :
                      badge.status === 'disconnected' ? 'text-red-700' : 'text-gray-700'
                    }`}>
                      {badge.text}
                    </span>
                  </div>
                </div>
                
                {/* Status Text */}
                <div className="mb-3">
                  <p className={`text-sm font-bold ${
                    badge.status === 'connected' ? 'text-green-600' :
                    badge.status === 'warning' ? 'text-yellow-600' :
                    badge.status === 'disconnected' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {badge.status === 'connected' ? '● CONNECTED' :
                     badge.status === 'warning' ? '● SLOW CONNECTION' :
                     badge.status === 'disconnected' ? '○ DISCONNECTED' : '◐ CONNECTING...'}
                  </p>
                  {badge.status === 'disconnected' && connectionStatus[rs.id]?.lastSeen && (
                    <p className="text-xs text-gray-500 mt-1">
                      Last seen: {connectionStatus[rs.id].lastSeen.toLocaleTimeString('id-ID')}
                    </p>
                  )}
                </div>
                
                {unitData?.lastData && (
                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-gray-100">
                    <div>
                      <p className="text-gray-500">Temp</p>
                      <p className="font-semibold text-gray-700">
                        {parseFloat(unitData.lastData['Temperature (°C)']).toFixed(1)}°C
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Fuel</p>
                      <p className="font-semibold text-gray-700">
                        {parseFloat(unitData.lastData['Fuel Level (%)']).toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
                
                {!unitData?.lastData && badge.status === 'disconnected' && (
                  <p className="text-xs text-red-500 mt-2">No data available</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Emergency Alert */}
        {latestData?.emergencyStop === 1 && (
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-lg p-6 mb-6 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">EMERGENCY STOP ACTIVE!</h3>
                <p className="text-red-100">Unit {selectedRS} dalam kondisi emergency stop</p>
              </div>
            </div>
          </div>
        )}

        {/* Connection Lost Alert */}
        {currentConnection.status === 'disconnected' && (
          <div className="bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-white rounded-full p-3">
                <AlertTriangle className="w-8 h-8 text-gray-600" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">CONNECTION LOST</h3>
                <p className="text-gray-100">
                  Unit {selectedRS} tidak terhubung. Terakhir terlihat: {' '}
                  {currentConnection.lastSeen?.toLocaleTimeString('id-ID') || 'Unknown'}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sensor Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <SensorCard
            icon={Thermometer}
            title="Temperature"
            value={latestData?.temperature.toFixed(1) || 0}
            unit="°C"
            status={latestData?.temperature > 90 ? 'danger' : latestData?.temperature > 80 ? 'warning' : 'normal'}
          />
          <SensorCard
            icon={Gauge}
            title="Pressure"
            value={latestData?.pressure.toFixed(1) || 0}
            unit="bar"
            status={latestData?.pressure > 150 ? 'danger' : latestData?.pressure > 130 ? 'warning' : 'normal'}
          />
          <SensorCard
            icon={Droplet}
            title="Hydraulic Oil"
            value={latestData?.hydraulicOil.toFixed(1) || 0}
            unit="%"
            status={latestData?.hydraulicOil < 30 ? 'danger' : latestData?.hydraulicOil < 50 ? 'warning' : 'normal'}
          />
          <SensorCard
            icon={Fuel}
            title="Fuel Level"
            value={latestData?.fuelLevel.toFixed(1) || 0}
            unit="%"
            status={latestData?.fuelLevel < 20 ? 'danger' : latestData?.fuelLevel < 40 ? 'warning' : 'normal'}
          />
          <SensorCard
            icon={Activity}
            title="Engine RPM"
            value={latestData?.engineRPM || 0}
            unit="RPM"
            status="normal"
          />
          <div className={`rounded-xl shadow-md p-5 border-l-4 ${
            currentStatus === 'danger' ? 'bg-red-50 border-red-500' :
            currentStatus === 'warning' ? 'bg-yellow-50 border-yellow-500' :
            'bg-green-50 border-green-500'
          }`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-lg ${
                currentStatus === 'danger' ? 'bg-red-100' :
                currentStatus === 'warning' ? 'bg-yellow-100' : 'bg-green-100'
              }`}>
                <Activity className={`w-5 h-5 ${
                  currentStatus === 'danger' ? 'text-red-500' :
                  currentStatus === 'warning' ? 'text-yellow-500' : 'text-green-500'
                }`} />
              </div>
              <p className="text-gray-500 text-xs font-medium uppercase">Status</p>
            </div>
            <p className={`text-3xl font-bold ${
              currentStatus === 'danger' ? 'text-red-600' :
              currentStatus === 'warning' ? 'text-yellow-600' :
              'text-green-600'
            }`}>
              {currentStatus.toUpperCase()}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Temperature & Pressure</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.slice(-20)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="temperature" stroke="#ef4444" name="Temp (°C)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="pressure" stroke="#3b82f6" name="Press (bar)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Oil & Fuel Levels</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.slice(-20)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="hydraulicOil" stroke="#10b981" name="Oil (%)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="fuelLevel" stroke="#f59e0b" name="Fuel (%)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Engine RPM History</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={data.slice(-20)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="engineRPM" stroke="#8b5cf6" name="RPM" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReachStackerDashboard;
