const axios = require('axios');
const express = require('express');
const app = express();

const port = process.env.PORT || 3000; // ใช้ค่า PORT จาก Environment ถ้าไม่มีให้ใช้ 3000

let weatherData = null;
let lastUpdate = 0; // เวลาที่อัปเดตล่าสุด (timestamp)

// ฟังก์ชันเช็กอายุข้อมูล
function isDataExpired() {
    const now = Date.now();
    return (now - lastUpdate) > 60 * 60 * 1000; // ถ้าเกิน 1 ชั่วโมงให้ดึงใหม่
}

// ฟังก์ชันดึงข้อมูลใหม่
async function fetchWeather() {
    try {
        const response = await axios.get('https://data.tmd.go.th/api/weather/forecast7days?province=เชียงใหม่');
        console.log("🔍 Data received:", response.data); // เช็กว่าข้อมูลที่ได้มาคืออะไร
        weatherData = response.data;
        lastUpdate = Date.now();
        console.log("✅ ดึงข้อมูลใหม่สำเร็จ:", new Date(lastUpdate).toLocaleString());
    } catch (error) {
        console.error("❌ ดึงข้อมูลพยากรณ์ล้มเหลว:", error);
    }
}

// ดึงข้อมูลใหม่ทุก 1 ชั่วโมง
setInterval(() => {
    axios.get('http://localhost:' + port + '/status')
        .then(() => console.log("✅ Keeping server alive"))
        .catch(err => console.error("❌ Keep-alive error:", err));
}, 5 * 60 * 1000); // ทุก 5 นาที

fetchWeather(); // ดึงข้อมูลทันทีเมื่อเริ่มต้นเซิร์ฟเวอร์

// 🔹 เพิ่ม Route `/`
app.get('/', (req, res) => {
    res.send('🌤️ API พยากรณ์อากาศพร้อมใช้งาน! ใช้ /weather หรือ /status');
});

// 🔹 เพิ่ม Route `/status`
app.get('/status', (req, res) => {
    res.json({ status: "API is running!", lastUpdate: new Date(lastUpdate).toLocaleString() });
});

// API ให้ข้อมูลพยากรณ์ล่าสุด
app.get('/weather', async (req, res) => {
    if (!weatherData || isDataExpired()) {
        await fetchWeather(); // ดึงข้อมูลใหม่
    }
    res.json({
        message: "พยากรณ์อากาศ 7 วัน",
        lastUpdate: new Date(lastUpdate).toLocaleString(),
        forecast: weatherData
    });
});

// เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`🌎 Server is running on http://localhost:${port}`);
}).on("error", (err) => {
    console.error("❌ Server error:", err);
});

