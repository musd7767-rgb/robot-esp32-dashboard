# دليل شامل: بناء Dashboard للتحكم في الروبوت عبر ESP32

**المؤلف**: Manus AI  
**التاريخ**: أبريل 2026  
**المستوى**: مبتدئ إلى متقدم

---

## جدول المحتويات

1. [مقدمة عامة](#مقدمة-عامة)
2. [فهم المكونات الأساسية](#فهم-المكونات-الأساسية)
3. [تقنيات الاتصال](#تقنيات-الاتصال)
4. [مراقبة استهلاك الطاقة](#مراقبة-استهلاك-الطاقة)
5. [البنية المعمارية](#البنية-المعمارية)
6. [خطوات البدء العملية](#خطوات-البدء-العملية)
7. [أمثلة عملية](#أمثلة-عملية)
8. [استكشاف الأخطاء](#استكشاف-الأخطاء)
9. [المراجع والموارد](#المراجع-والموارد)

---

## مقدمة عامة

### الهدف من المشروع

يهدف هذا المشروع إلى بناء لوحة تحكم ويب (Dashboard) متقدمة تتيح لك التحكم الكامل في روبوت عبر الإنترنت أو الشبكة المحلية. ستتمكن من:

- **التحكم في حركة الروبوت**: تشغيل المحركات والتحكم في السرعة والاتجاه
- **مراقبة استهلاك الطاقة**: قياس الجهد والتيار والطاقة المستهلكة
- **عرض البيانات الفعلية**: درجة الحرارة والرطوبة وقراءات المستشعرات الأخرى
- **تسجيل البيانات**: حفظ السجلات التاريخية للأداء والاستهلاك

### لماذا ESP32؟

**ESP32** هو معالج دقيق قوي وفعال من حيث التكلفة يوفر:

- **اتصال WiFi و Bluetooth مدمج**: لا تحتاج إلى وحدات إضافية
- **قوة معالجة عالية**: معالج ثنائي النواة بسرعة 240 MHz
- **استهلاك طاقة منخفض**: مناسب للأجهزة التي تعمل بالبطارية
- **دعم مكتبات واسعة**: مجتمع كبير وموارد تعليمية وفيرة
- **سعر منخفض**: حوالي 5-10 دولارات فقط

---

## فهم المكونات الأساسية

### أولاً: مكونات الروبوت (جانب الأجهزة)

#### 1. ESP32 Microcontroller

| المواصفة | القيمة |
|---------|--------|
| المعالج | Xtensa Dual-Core 32-bit |
| السرعة | 240 MHz |
| الذاكرة | 520 KB SRAM |
| التخزين | 4 MB Flash |
| WiFi | 802.11 b/g/n |
| Bluetooth | BLE 4.2 |
| GPIO Pins | 34 دبوس |
| ADC Channels | 12 قناة |
| PWM Channels | 16 قناة |

#### 2. مستشعرات الطاقة

**INA219 - مستشعر قياس الطاقة الموصى به:**

| المواصفة | القيمة |
|---------|--------|
| نطاق الجهد | 0-26 فولت |
| نطاق التيار | ±3.2 أمبير |
| الدقة | ±0.4% |
| الواجهة | I2C |
| دقة الدقة | 16-bit |
| استهلاك الطاقة | 0.7 mA |

**كيفية الاتصال:**
- VCC → 3.3V من ESP32
- GND → GND
- SDA → GPIO 21 (ESP32)
- SCL → GPIO 22 (ESP32)

#### 3. المحركات والمشغلات

**أنواع المحركات الشائعة:**

- **محركات DC**: بسيطة وسهلة التحكم، تحتاج إلى وحدة تحكم (Motor Driver)
- **محركات Servo**: دقيقة للتحكم في الزوايا
- **محركات Stepper**: للحركة الدقيقة والمحددة
- **محركات Brushless**: عالية الكفاءة والأداء

**وحدة التحكم (Motor Driver):**
- **L298N**: للمحركات DC، تحكم في اتجاه وسرعة
- **DRV8833**: أصغر حجماً وأكثر كفاءة
- **BTS7960**: للتيارات العالية

#### 4. مستشعرات إضافية

| المستشعر | الاستخدام | الواجهة |
|---------|-----------|--------|
| DHT22 | درجة الحرارة والرطوبة | Digital |
| Ultrasonic | قياس المسافة | Digital |
| IR Sensor | كشف الحواجز | Digital/Analog |
| Accelerometer (MPU6050) | قياس التسارع | I2C |
| Gyroscope | قياس الدوران | I2C |

### ثانياً: مكونات Dashboard (جانب البرمجيات)

#### 1. Frontend (واجهة المستخدم)

**المكتبات المستخدمة:**

```
React 19              - إطار عمل JavaScript
Tailwind CSS 4        - تصميم الواجهة
shadcn/ui            - مكونات جاهزة عالية الجودة
Recharts             - رسوم بيانية تفاعلية
Lucide React         - أيقونات احترافية
Framer Motion        - تأثيرات حركية سلسة
```

#### 2. Communication Layer (طبقة الاتصال)

**خيارات الاتصال:**

| الخيار | المميزات | العيوب |
|--------|---------|--------|
| **WebSocket** | اتصال ثنائي الاتجاه، بيانات فعلية | يتطلب خادم ويب |
| **HTTP Polling** | بسيط، يعمل في كل مكان | تأخير أكبر، استهلاك أعلى |
| **Server-Sent Events** | بيانات فعلية من الخادم | اتجاه واحد فقط |
| **Web Bluetooth** | لا يحتاج WiFi، مباشر | نطاق محدود، لا يعمل على iOS |

---

## تقنيات الاتصال

### 1. WiFi + WebSocket (الأفضل للموثوقية)

#### مميزات هذه الطريقة:

✅ **اتصال مستقر وموثوق**  
✅ **نطاق طويل** (حتى 100 متر في الأماكن المفتوحة)  
✅ **بيانات فعلية** (Real-time)  
✅ **يعمل على جميع الأجهزة**  
✅ **يدعم البث المتعدد** (Multiple clients)

#### كيفية العمل:

```
1. ESP32 يتصل بشبكة WiFi
2. ESP32 ينشئ خادم ويب (Web Server)
3. Dashboard يتصل عبر WebSocket
4. البيانات تُرسل في الوقت الفعلي
5. الأوامر تُرسل من Dashboard إلى ESP32
```

#### كود ESP32 (مثال مبسط):

```cpp
#include <WiFi.h>
#include <WebSocketsServer.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

WebSocketsServer webSocket = WebSocketsServer(81);

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
  if (type == WStype_TEXT) {
    // استقبال أوامر من Dashboard
    String command = String((char*) payload);
    
    if (command == "MOTOR_FORWARD") {
      digitalWrite(MOTOR_PIN, HIGH);
    } else if (command == "MOTOR_STOP") {
      digitalWrite(MOTOR_PIN, LOW);
    }
  }
}

void setup() {
  Serial.begin(115200);
  
  // الاتصال بـ WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi connected!");
  Serial.println(WiFi.localIP());
  
  // بدء WebSocket Server
  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

void loop() {
  webSocket.loop();
  
  // قراءة المستشعرات وإرسالها
  float voltage = readVoltage();
  float current = readCurrent();
  
  String data = "{\"voltage\": " + String(voltage) + ", \"current\": " + String(current) + "}";
  webSocket.broadcastTXT(data);
  
  delay(500); // إرسال البيانات كل 500ms
}
```

### 2. Bluetooth Low Energy (BLE) + Web Bluetooth API

#### مميزات هذه الطريقة:

✅ **استهلاك طاقة منخفض جداً**  
✅ **اتصال مباشر من المتصفح**  
✅ **لا يحتاج WiFi**  
✅ **نطاق معقول** (10-100 متر)

#### قيود مهمة:

❌ **لا يعمل على iOS** (حالياً)  
❌ **نطاق محدود**  
❌ **أبطأ من WiFi**

#### مفاهيم BLE الأساسية:

**GATT (Generic Attribute Profile):**
- **Service**: مجموعة من الخدمات المرتبطة
- **Characteristic**: البيانات الفعلية
- **Descriptor**: معلومات عن البيانات
- **UUID**: معرّف فريد لكل عنصر

**مثال على البنية:**

```
Service UUID: 180A (Device Information)
├── Characteristic 1: Battery Level (UUID: 2A19)
├── Characteristic 2: Temperature (UUID: 2A1C)
└── Characteristic 3: Motor Control (UUID: Custom)
```

#### كود ESP32 (BLE Server):

```cpp
#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;

void setup() {
  Serial.begin(115200);
  
  // إنشاء BLE Device
  BLEDevice::init("RobotController");
  
  // إنشاء BLE Server
  pServer = BLEDevice::createServer();
  
  // إنشاء Service
  BLEService *pService = pServer->createService("180A");
  
  // إنشاء Characteristic
  pCharacteristic = pService->createCharacteristic(
    "2A19",
    BLECharacteristic::PROPERTY_READ | 
    BLECharacteristic::PROPERTY_NOTIFY
  );
  
  // إضافة Descriptor للإخطارات
  pCharacteristic->addDescriptor(new BLE2902());
  
  // بدء الخدمة
  pService->start();
  
  // بدء الإعلان
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID("180A");
  pAdvertising->start();
}

void loop() {
  // قراءة البيانات وإرسالها
  uint8_t batteryLevel = readBatteryLevel();
  pCharacteristic->setValue(&batteryLevel, 1);
  pCharacteristic->notify();
  
  delay(1000);
}
```

#### كود Dashboard (Web Bluetooth):

```javascript
// البحث عن جهاز BLE
const device = await navigator.bluetooth.requestDevice({
  filters: [{ name: 'RobotController' }],
  optionalServices: ['180A']
});

// الاتصال بالجهاز
const server = await device.gatt.connect();

// الحصول على الخدمة
const service = await server.getPrimaryService('180A');

// الحصول على الخاصية
const characteristic = await service.getCharacteristic('2A19');

// قراءة البيانات
const value = await characteristic.readValue();
console.log('Battery Level:', value.getUint8(0));

// الاستماع للتحديثات
characteristic.addEventListener('characteristicvaluechanged', (event) => {
  const value = event.target.value.getUint8(0);
  console.log('Battery Level Updated:', value);
});

// بدء الاستماع
await characteristic.startNotifications();
```

### 3. HTTP Polling (الأبسط للبدء)

#### مميزات هذه الطريقة:

✅ **بسيط جداً للتنفيذ**  
✅ **يعمل على جميع الأجهزة**  
✅ **لا يتطلب مكتبات معقدة**

#### عيوب هذه الطريقة:

❌ **تأخير في التحديثات**  
❌ **استهلاك أكبر للطاقة**  
❌ **حمل أكبر على الخادم**

#### كود ESP32 (HTTP Server):

```cpp
#include <WiFi.h>
#include <WebServer.h>

WebServer server(80);

void handleRoot() {
  float voltage = readVoltage();
  float current = readCurrent();
  
  String json = "{\"voltage\": " + String(voltage) + ", \"current\": " + String(current) + "}";
  server.send(200, "application/json", json);
}

void setup() {
  WiFi.begin("SSID", "PASSWORD");
  
  server.on("/", handleRoot);
  server.begin();
}

void loop() {
  server.handleClient();
}
```

#### كود Dashboard (Fetch API):

```javascript
async function fetchRobotData() {
  try {
    const response = await fetch('http://ESP32_IP/');
    const data = await response.json();
    console.log('Voltage:', data.voltage);
    console.log('Current:', data.current);
  } catch (error) {
    console.error('Error:', error);
  }
}

// استدعاء الدالة كل 500ms
setInterval(fetchRobotData, 500);
```

---

## مراقبة استهلاك الطاقة

### المستشعرات المستخدمة

#### INA219 - الخيار الأول (الموصى به)

**المميزات:**
- دقة عالية جداً (±0.4%)
- واجهة I2C بسيطة
- قياس الجهد والتيار والطاقة
- استهلاك طاقة منخفض

**الاتصال مع ESP32:**

```
INA219 Pin    →    ESP32 Pin
VCC           →    3.3V
GND           →    GND
SDA           →    GPIO 21
SCL           →    GPIO 22
```

**كود قراءة البيانات:**

```cpp
#include <Wire.h>
#include <Adafruit_INA219.h>

Adafruit_INA219 ina219;

void setup() {
  Serial.begin(115200);
  
  if (!ina219.begin()) {
    Serial.println("Failed to find INA219 chip");
    while (1) { delay(10); }
  }
  
  Serial.println("INA219 initialized");
}

void loop() {
  float shuntvoltage = ina219.getShuntVoltage_mV();
  float busvoltage = ina219.getBusVoltage_V();
  float current_mA = ina219.getCurrent_mA();
  float power_mW = ina219.getPower_mW();
  
  Serial.print("Bus Voltage: "); Serial.print(busvoltage); Serial.println(" V");
  Serial.print("Shunt Voltage: "); Serial.print(shuntvoltage); Serial.println(" mV");
  Serial.print("Current: "); Serial.print(current_mA); Serial.println(" mA");
  Serial.print("Power: "); Serial.print(power_mW); Serial.println(" mW");
  
  delay(500);
}
```

### البيانات المراقبة

#### 1. الجهد (Voltage)
- **الجهد الكلي**: الجهد الكلي للبطارية
- **جهد الحمل**: الجهد عند نقطة الاستهلاك
- **انخفاض الجهد**: الفرق بين الاثنين

#### 2. التيار (Current)
- **التيار الفعلي**: التيار المستهلك حالياً
- **التيار الأقصى**: أقصى تيار مسجل
- **متوسط التيار**: المتوسط على فترة زمنية

#### 3. الطاقة (Power)
```
Power (W) = Voltage (V) × Current (A)
```

#### 4. الطاقة المستهلكة (Energy)
```
Energy (Wh) = Power (W) × Time (h)
```

### عرض البيانات على Dashboard

```javascript
// مثال: رسم بياني لاستهلاك الطاقة
const [powerData, setPowerData] = useState([]);

useEffect(() => {
  const interval = setInterval(async () => {
    const response = await fetch('http://ESP32_IP/power');
    const data = await response.json();
    
    setPowerData(prev => [...prev.slice(-59), {
      time: new Date().toLocaleTimeString(),
      power: data.power,
      voltage: data.voltage,
      current: data.current
    }]);
  }, 1000);
  
  return () => clearInterval(interval);
}, []);

// عرض الرسم البياني
<LineChart data={powerData}>
  <CartesianGrid />
  <XAxis dataKey="time" />
  <YAxis />
  <Tooltip />
  <Legend />
  <Line type="monotone" dataKey="power" stroke="#8884d8" />
  <Line type="monotone" dataKey="voltage" stroke="#82ca9d" />
</LineChart>
```

---

## البنية المعمارية

### الهيكل العام للنظام

```
┌─────────────────────────────────────────────────────────────┐
│                   Dashboard (Web Interface)                 │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  React Components                                    │   │
│  │  - Motor Control Panel                               │   │
│  │  - Real-time Charts                                  │   │
│  │  - Status Indicators                                 │   │
│  │  - Settings Panel                                    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────┬──────────────────────────────────────────┘
                  │
        ┌─────────┴──────────┐
        │                    │
   WiFi/WebSocket      Bluetooth BLE
        │                    │
┌───────▼────────────────────▼──────────────┐
│         ESP32 Microcontroller             │
│  ┌─────────────────────────────────────┐  │
│  │ Communication Layer                 │  │
│  │ - WiFi Manager                      │  │
│  │ - WebSocket Server                  │  │
│  │ - BLE Server                        │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │ Control Logic                       │  │
│  │ - Motor Control                     │  │
│  │ - Sensor Reading                    │  │
│  │ - Power Management                  │  │
│  └─────────────────────────────────────┘  │
│  ┌─────────────────────────────────────┐  │
│  │ Data Processing                     │  │
│  │ - Sensor Calibration                │  │
│  │ - Data Filtering                    │  │
│  │ - Logging                           │  │
│  └─────────────────────────────────────┘  │
└───────┬──────────────────────────────────┬─┘
        │                                  │
   ┌────▼────┐  ┌────────┐  ┌──────────┐  │
   │ Motors  │  │ Sensors│  │ Storage  │  │
   │ & GPIO  │  │(INA219)│  │ (SD Card)│  │
   └─────────┘  └────────┘  └──────────┘  │
```

### تدفق البيانات

```
1. قراءة المستشعرات
   ↓
2. معالجة البيانات
   ↓
3. تخزين البيانات محلياً
   ↓
4. إرسال البيانات إلى Dashboard
   ↓
5. عرض البيانات على الرسوم البيانية
   ↓
6. استقبال الأوامر من Dashboard
   ↓
7. تنفيذ الأوامر على الروبوت
```

---

## خطوات البدء العملية

### المرحلة 1: إعداد بيئة التطوير

#### الخطوة 1.1: تثبيت Arduino IDE

1. قم بتحميل [Arduino IDE](https://www.arduino.cc/en/software)
2. قم بتثبيت البرنامج على جهازك
3. افتح Arduino IDE

#### الخطوة 1.2: تثبيت ESP32 Board Package

1. اذهب إلى **File** → **Preferences**
2. في حقل "Additional Board Manager URLs"، أضف:
   ```
   https://dl.espressif.com/dl/package_esp32_index.json
   ```
3. اذهب إلى **Tools** → **Board Manager**
4. ابحث عن "ESP32" وقم بالتثبيت

#### الخطوة 1.3: تثبيت المكتبات المطلوبة

1. اذهب إلى **Sketch** → **Include Library** → **Manage Libraries**
2. ثبّت المكتبات التالية:
   - `Adafruit INA219` (لقراءة الطاقة)
   - `WebSocketsServer` (للاتصال)
   - `ArduinoJson` (لمعالجة JSON)

### المرحلة 2: كتابة كود ESP32

#### الخطوة 2.1: إعداد الاتصال بـ WiFi

```cpp
#include <WiFi.h>

const char* ssid = "YOUR_SSID";
const char* password = "YOUR_PASSWORD";

void setup() {
  Serial.begin(115200);
  
  Serial.println("\n\nStarting WiFi connection...");
  WiFi.begin(ssid, password);
  
  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi connected!");
    Serial.print("IP address: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nFailed to connect to WiFi");
  }
}

void loop() {
  // سيتم إضافة الكود هنا
}
```

#### الخطوة 2.2: إضافة قراءة المستشعرات

```cpp
#include <Wire.h>
#include <Adafruit_INA219.h>

Adafruit_INA219 ina219;

void setupSensors() {
  if (!ina219.begin()) {
    Serial.println("Failed to find INA219 chip");
    while (1) { delay(10); }
  }
  Serial.println("INA219 initialized");
}

struct SensorData {
  float voltage;
  float current;
  float power;
};

SensorData readSensors() {
  SensorData data;
  data.voltage = ina219.getBusVoltage_V();
  data.current = ina219.getCurrent_mA() / 1000.0; // تحويل إلى أمبير
  data.power = ina219.getPower_mW() / 1000.0; // تحويل إلى واط
  return data;
}
```

#### الخطوة 2.3: إضافة التحكم في المحركات

```cpp
#define MOTOR_PIN_1 12
#define MOTOR_PIN_2 13
#define MOTOR_PWM_PIN 14

void setupMotors() {
  pinMode(MOTOR_PIN_1, OUTPUT);
  pinMode(MOTOR_PIN_2, OUTPUT);
  ledcSetup(0, 5000, 8); // PWM: 5kHz, 8-bit
  ledcAttachPin(MOTOR_PWM_PIN, 0);
}

void motorForward(int speed) {
  digitalWrite(MOTOR_PIN_1, HIGH);
  digitalWrite(MOTOR_PIN_2, LOW);
  ledcWrite(0, speed); // 0-255
}

void motorBackward(int speed) {
  digitalWrite(MOTOR_PIN_1, LOW);
  digitalWrite(MOTOR_PIN_2, HIGH);
  ledcWrite(0, speed);
}

void motorStop() {
  digitalWrite(MOTOR_PIN_1, LOW);
  digitalWrite(MOTOR_PIN_2, LOW);
  ledcWrite(0, 0);
}
```

### المرحلة 3: بناء Dashboard

#### الخطوة 3.1: إنشاء مشروع React

```bash
# استخدام Manus webdev
# (سيتم إنشاء المشروع تلقائياً)
```

#### الخطوة 3.2: بناء واجهة التحكم

```jsx
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function RobotDashboard() {
  const [robotData, setRobotData] = useState({
    voltage: 0,
    current: 0,
    power: 0
  });
  
  const [motorStatus, setMotorStatus] = useState('stopped');
  
  // قراءة البيانات من ESP32
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('http://ESP32_IP/data');
        const data = await response.json();
        setRobotData(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  // إرسال أوامر إلى ESP32
  const sendCommand = async (command) => {
    try {
      await fetch(`http://ESP32_IP/command?cmd=${command}`);
      setMotorStatus(command);
    } catch (error) {
      console.error('Error sending command:', error);
    }
  };
  
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Robot Controller Dashboard</h1>
      
      {/* عرض البيانات */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-semibold">Voltage</h3>
          <p className="text-2xl font-bold">{robotData.voltage.toFixed(2)} V</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-semibold">Current</h3>
          <p className="text-2xl font-bold">{robotData.current.toFixed(2)} A</p>
        </Card>
        
        <Card className="p-4">
          <h3 className="text-sm font-semibold">Power</h3>
          <p className="text-2xl font-bold">{robotData.power.toFixed(2)} W</p>
        </Card>
      </div>
      
      {/* أزرار التحكم */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Motor Control</h2>
        <div className="flex gap-4">
          <Button onClick={() => sendCommand('forward')} className="flex-1">
            Forward
          </Button>
          <Button onClick={() => sendCommand('backward')} className="flex-1">
            Backward
          </Button>
          <Button onClick={() => sendCommand('stop')} className="flex-1" variant="destructive">
            Stop
          </Button>
        </div>
      </div>
      
      <p className="text-sm text-gray-600">Status: {motorStatus}</p>
    </div>
  );
}
```

---

## أمثلة عملية

### مثال 1: نظام تحكم بسيط عبر HTTP

**كود ESP32:**

```cpp
#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>

const char* ssid = "YourSSID";
const char* password = "YourPassword";

WebServer server(80);

// متغيرات الحالة
int motorSpeed = 0;
bool motorRunning = false;

void handleRoot() {
  DynamicJsonDocument doc(256);
  doc["motorSpeed"] = motorSpeed;
  doc["motorRunning"] = motorRunning;
  doc["voltage"] = 12.5;
  doc["current"] = 2.3;
  
  String json;
  serializeJson(doc, json);
  
  server.send(200, "application/json", json);
}

void handleMotor() {
  if (server.hasArg("speed")) {
    motorSpeed = server.arg("speed").toInt();
    motorRunning = motorSpeed > 0;
    
    // تطبيق السرعة على المحرك
    analogWrite(MOTOR_PIN, motorSpeed);
    
    server.send(200, "text/plain", "OK");
  } else {
    server.send(400, "text/plain", "Missing speed parameter");
  }
}

void setup() {
  Serial.begin(115200);
  
  // إعداد WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  
  Serial.println("\nWiFi connected!");
  Serial.println(WiFi.localIP());
  
  // إعداد الخادم
  server.on("/", handleRoot);
  server.on("/motor", handleMotor);
  server.begin();
  
  // إعداد المحرك
  pinMode(MOTOR_PIN, OUTPUT);
}

void loop() {
  server.handleClient();
}
```

**كود Dashboard:**

```jsx
import React, { useState, useEffect } from 'react';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';

export default function SimpleController() {
  const [speed, setSpeed] = useState(0);
  const [data, setData] = useState({ voltage: 0, current: 0 });
  
  const ESP32_IP = 'http://192.168.1.100';
  
  // تحديث السرعة
  const updateSpeed = async (newSpeed) => {
    setSpeed(newSpeed);
    try {
      await fetch(`${ESP32_IP}/motor?speed=${newSpeed}`);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  // قراءة البيانات
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`${ESP32_IP}/`);
        const json = await response.json();
        setData(json);
      } catch (error) {
        console.error('Error:', error);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="p-6 space-y-6">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Motor Speed Control</h2>
        <Slider
          value={[speed]}
          onValueChange={(value) => updateSpeed(value[0])}
          min={0}
          max={255}
          step={1}
          className="w-full"
        />
        <p className="text-center mt-4 text-lg font-semibold">{speed}/255</p>
      </Card>
      
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Power Status</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Voltage</p>
            <p className="text-2xl font-bold">{data.voltage} V</p>
          </div>
          <div>
            <p className="text-gray-600">Current</p>
            <p className="text-2xl font-bold">{data.current} A</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
```

### مثال 2: نظام مراقبة الطاقة مع رسوم بيانية

```jsx
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from '@/components/ui/card';

export default function PowerMonitor() {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    maxPower: 0,
    avgPower: 0,
    totalEnergy: 0
  });
  
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('http://192.168.1.100/power');
        const data = await response.json();
        
        setChartData(prev => {
          const updated = [...prev, {
            time: new Date().toLocaleTimeString(),
            power: data.power,
            voltage: data.voltage,
            current: data.current
          }];
          
          // الاحتفاظ بآخر 60 نقطة
          return updated.slice(-60);
        });
        
        // حساب الإحصائيات
        setStats({
          maxPower: Math.max(...chartData.map(d => d.power)),
          avgPower: chartData.reduce((a, b) => a + b.power, 0) / chartData.length,
          totalEnergy: chartData.length * 0.5 / 3600 // Wh (assuming 0.5s interval)
        });
      } catch (error) {
        console.error('Error:', error);
      }
    }, 500);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Max Power</p>
          <p className="text-2xl font-bold">{stats.maxPower.toFixed(2)} W</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Avg Power</p>
          <p className="text-2xl font-bold">{stats.avgPower.toFixed(2)} W</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Energy</p>
          <p className="text-2xl font-bold">{stats.totalEnergy.toFixed(3)} Wh</p>
        </Card>
      </div>
      
      <Card className="p-6">
        <h2 className="text-xl font-bold mb-4">Power Consumption</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="power" stroke="#8884d8" dot={false} />
            <Line type="monotone" dataKey="voltage" stroke="#82ca9d" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
```

---

## استكشاف الأخطاء

### المشكلة 1: لا يمكن الاتصال بـ ESP32

**الأسباب المحتملة:**
- ESP32 غير متصل بـ WiFi
- IP Address خاطئ
- جدار الحماية يحظر الاتصال
- البرنامج على ESP32 لم يبدأ الخادم

**الحل:**
1. تحقق من أن ESP32 متصل بـ WiFi (استخدم Serial Monitor)
2. اطبع IP Address من Serial Monitor
3. تأكد من أن جهازك على نفس الشبكة
4. أعد تشغيل ESP32

### المشكلة 2: البيانات غير دقيقة

**الأسباب المحتملة:**
- معايرة خاطئة للمستشعر
- تداخل كهربائي
- كابلات ضعيفة

**الحل:**
1. قم بمعايرة المستشعر (INA219)
2. استخدم كابلات قصيرة وسميكة
3. أضف مكثفات تصفية

### المشكلة 3: تأخير في الاستجابة

**الأسباب المحتملة:**
- فاصل زمني طويل بين الطلبات
- معالج ESP32 مشغول
- شبكة WiFi ضعيفة

**الحل:**
1. قلل الفاصل الزمني
2. قلل حجم البيانات المُرسلة
3. استخدم WebSocket بدلاً من HTTP Polling

---

## المراجع والموارد

### المراجع الرسمية:

1. **Espressif Systems - ESP32 Official Documentation**  
   https://docs.espressif.com/projects/esp-idf/

2. **Random Nerd Tutorials - ESP32 Web Server Guide**  
   https://randomnerdtutorials.com/esp32-web-server-beginners-guide/

3. **Random Nerd Tutorials - ESP32 Web Bluetooth**  
   https://randomnerdtutorials.com/esp32-web-bluetooth/

4. **Mongoose Library - ESP32 Device Dashboard**  
   https://mongoose.ws/articles/esp32-device-dashboard/

### مكتبات مهمة:

| المكتبة | الاستخدام | الرابط |
|--------|-----------|--------|
| **Adafruit INA219** | قراءة الطاقة | https://github.com/adafruit/Adafruit_INA219 |
| **WebSocketsServer** | خادم WebSocket | https://github.com/Links2004/arduinoWebSockets |
| **ArduinoJson** | معالجة JSON | https://github.com/bblanchon/ArduinoJson |
| **BLEDevice** | Bluetooth Low Energy | https://github.com/espressif/arduino-esp32 |

### موارد تعليمية:

- **Arduino Official Documentation**: https://www.arduino.cc/
- **ESP32 Pinout Reference**: https://randomnerdtutorials.com/esp32-pinout-reference-which-gpio-pins-should-you-use/
- **BLE Basics**: https://www.bluetooth.com/specifications/specs/
- **Web Bluetooth API**: https://webbluetoothcg.github.io/web-bluetooth/

---

## الخلاصة والخطوات التالية

### ما تعلمته:

✅ فهم مكونات الروبوت والمستشعرات  
✅ طرق الاتصال المختلفة (WiFi, BLE, HTTP)  
✅ مراقبة استهلاك الطاقة  
✅ بناء Dashboard تفاعلي  
✅ أمثلة عملية وكاملة

### الخطوات التالية:

1. **ابدأ بمشروع بسيط**: استخدم HTTP Polling أولاً
2. **أضف المستشعرات**: ابدأ بـ INA219
3. **بناء Dashboard**: استخدم React و Tailwind
4. **اختبر واستكشف الأخطاء**: تأكد من الاستقرار
5. **أضف ميزات متقدمة**: WebSocket, BLE, تسجيل البيانات

### نصائح مهمة:

💡 ابدأ بسيط ثم أضف التعقيد تدريجياً  
💡 اختبر كل جزء بشكل منفصل قبل الدمج  
💡 استخدم Serial Monitor للتصحيح  
💡 احفظ البيانات التاريخية للتحليل  
💡 وثّق كودك بشكل جيد

---

**آخر تحديث**: أبريل 2026  
**الإصدار**: 1.0
