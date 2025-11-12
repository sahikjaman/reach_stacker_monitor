/*
 * ESP32 Reach Stacker Sensor Monitor
 *
 * Hardware Requirements:
 * - ESP32 Board
 * - Temperature Sensor (e.g., DS18B20 or DHT22)
 * - Pressure Sensor (analog or I2C)
 * - Fuel Level Sensor (analog)
 * - Oil Level Sensor (analog)
 * - RPM Sensor (Hall effect or optical)
 * - Emergency Stop Button
 *
 * Libraries Required:
 * - WiFi.h
 * - HTTPClient.h
 * - ArduinoJson.h
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

// WiFi Credentials
const char *ssid = "YOUR_WIFI_SSID";
const char *password = "YOUR_WIFI_PASSWORD";

// Google Apps Script Web App URL
const char *serverUrl = "https://script.google.com/macros/s/AKfycbxWR6P0gby8gHFRFCPJIE3I85VAR3z45rCJ7FPhPdwqGoyNu9kyRKB2GMw_JS05FBm4gA/exec";

// Reach Stacker ID (change for each unit)
// Options: "RS-A", "RS-B", "RS-C"
const char *reachStackerID = "RS-A";

// Sensor Pins
#define TEMP_PIN 34
#define PRESSURE_PIN 35
#define OIL_PIN 32
#define FUEL_PIN 33
#define RPM_PIN 25
#define EMERGENCY_PIN 26

// Timing
unsigned long lastSendTime = 0;
const unsigned long sendInterval = 10000; // Send every 10 seconds

// Sensor readings
float temperature = 0;
float pressure = 0;
float hydraulicOil = 0;
float fuelLevel = 0;
int engineRPM = 0;
int emergencyStop = 0;

void setup()
{
    Serial.begin(115200);

    // Initialize pins
    pinMode(TEMP_PIN, INPUT);
    pinMode(PRESSURE_PIN, INPUT);
    pinMode(OIL_PIN, INPUT);
    pinMode(FUEL_PIN, INPUT);
    pinMode(RPM_PIN, INPUT);
    pinMode(EMERGENCY_PIN, INPUT_PULLUP);

    // Connect to WiFi
    Serial.println("Connecting to WiFi...");
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED)
    {
        delay(500);
        Serial.print(".");
    }

    Serial.println();
    Serial.println("WiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
    Serial.print("Reach Stacker ID: ");
    Serial.println(reachStackerID);
}

void loop()
{
    unsigned long currentTime = millis();

    // Read sensors
    readSensors();

    // Send data every interval
    if (currentTime - lastSendTime >= sendInterval)
    {
        if (WiFi.status() == WL_CONNECTED)
        {
            sendDataToGoogleSheets();
            lastSendTime = currentTime;
        }
        else
        {
            Serial.println("WiFi disconnected, reconnecting...");
            WiFi.reconnect();
        }
    }

    // Display data on serial monitor
    displayData();

    delay(1000); // Read sensors every second
}

void readSensors()
{
    // Temperature (simulated - replace with actual sensor reading)
    // Example: DS18B20, DHT22, or analog temperature sensor
    int tempRaw = analogRead(TEMP_PIN);
    temperature = map(tempRaw, 0, 4095, 20, 120); // Map to 20-120°C range
    temperature += random(-5, 5) * 0.1;           // Add some noise for simulation

    // Pressure (simulated - replace with actual sensor reading)
    // Example: Pressure transducer with 4-20mA or 0-5V output
    int pressureRaw = analogRead(PRESSURE_PIN);
    pressure = map(pressureRaw, 0, 4095, 0, 200); // Map to 0-200 bar range
    pressure += random(-3, 3) * 0.1;

    // Hydraulic Oil Level (simulated)
    int oilRaw = analogRead(OIL_PIN);
    hydraulicOil = map(oilRaw, 0, 4095, 0, 100); // Map to 0-100%
    hydraulicOil = constrain(hydraulicOil, 0, 100);

    // Fuel Level (simulated)
    int fuelRaw = analogRead(FUEL_PIN);
    fuelLevel = map(fuelRaw, 0, 4095, 0, 100); // Map to 0-100%
    fuelLevel = constrain(fuelLevel, 0, 100);

    // Engine RPM (simulated - replace with Hall sensor or pulse counter)
    int rpmRaw = analogRead(RPM_PIN);
    engineRPM = map(rpmRaw, 0, 4095, 0, 3000); // Map to 0-3000 RPM

    // Emergency Stop (digital input, active LOW)
    emergencyStop = !digitalRead(EMERGENCY_PIN);
}

void sendDataToGoogleSheets()
{
    HTTPClient http;

    Serial.println("\n--- Sending data to Google Sheets ---");

    // Create JSON payload
    StaticJsonDocument<256> doc;
    doc["reachStackerID"] = reachStackerID;
    doc["temperature"] = temperature;
    doc["pressure"] = pressure;
    doc["hydraulicOil"] = hydraulicOil;
    doc["fuelLevel"] = fuelLevel;
    doc["engineRPM"] = engineRPM;
    doc["emergencyStop"] = emergencyStop;

    String jsonPayload;
    serializeJson(doc, jsonPayload);

    Serial.println("Payload: " + jsonPayload);

    // Send HTTP POST request
    http.begin(serverUrl);
    http.addHeader("Content-Type", "application/json");

    int httpResponseCode = http.POST(jsonPayload);

    if (httpResponseCode > 0)
    {
        String response = http.getString();
        Serial.print("HTTP Response code: ");
        Serial.println(httpResponseCode);
        Serial.print("Response: ");
        Serial.println(response);
    }
    else
    {
        Serial.print("Error code: ");
        Serial.println(httpResponseCode);
        Serial.println("Failed to send data");
    }

    http.end();
    Serial.println("--- Data sent ---\n");
}

void displayData()
{
    Serial.println("=================================");
    Serial.print("Unit: ");
    Serial.println(reachStackerID);
    Serial.println("---------------------------------");
    Serial.print("Temperature: ");
    Serial.print(temperature, 1);
    Serial.println(" °C");

    Serial.print("Pressure: ");
    Serial.print(pressure, 1);
    Serial.println(" bar");

    Serial.print("Hydraulic Oil: ");
    Serial.print(hydraulicOil, 1);
    Serial.println(" %");

    Serial.print("Fuel Level: ");
    Serial.print(fuelLevel, 1);
    Serial.println(" %");

    Serial.print("Engine RPM: ");
    Serial.println(engineRPM);

    Serial.print("Emergency Stop: ");
    Serial.println(emergencyStop ? "ACTIVE ⚠️" : "Normal");
    Serial.println("=================================\n");

    // Warnings
    if (temperature > 90)
    {
        Serial.println("⚠️ WARNING: Temperature Critical!");
    }
    if (pressure > 150)
    {
        Serial.println("⚠️ WARNING: Pressure Critical!");
    }
    if (hydraulicOil < 30)
    {
        Serial.println("⚠️ WARNING: Low Hydraulic Oil!");
    }
    if (fuelLevel < 20)
    {
        Serial.println("⚠️ WARNING: Low Fuel Level!");
    }
    if (emergencyStop)
    {
        Serial.println("🚨 EMERGENCY STOP ACTIVATED!");
    }
}

/*
 * CALIBRATION NOTES:
 *
 * 1. Temperature Sensor:
 *    - Use actual temperature sensor library (e.g., DallasTemperature for DS18B20)
 *    - Calibrate offset and scale factor
 *
 * 2. Pressure Sensor:
 *    - Map voltage/current to pressure based on sensor datasheet
 *    - Example: 4-20mA → 0-200 bar
 *
 * 3. Oil/Fuel Level:
 *    - Calibrate empty and full tank values
 *    - May need linearization for non-linear sensors
 *
 * 4. RPM Sensor:
 *    - Use interrupt-based counting for accurate RPM
 *    - Calculate RPM from pulse frequency
 *
 * 5. Emergency Stop:
 *    - Use hardware debouncing or software debounce
 *    - Ensure fail-safe operation
 */

/*
 * DEPLOYMENT CHECKLIST:
 *
 * [ ] Update WiFi credentials
 * [ ] Set correct Reach Stacker ID
 * [ ] Verify Google Script URL
 * [ ] Test sensor readings
 * [ ] Calibrate all sensors
 * [ ] Test emergency stop
 * [ ] Verify data appears in Google Sheets
 * [ ] Test dashboard updates
 * [ ] Set up proper power supply
 * [ ] Install in weatherproof enclosure
 */
