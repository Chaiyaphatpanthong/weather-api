const axios = require('axios');
const express = require('express');
const cors = require('cors'); // ✅ เพิ่ม CORS
const app = express();

const port = process.env.PORT || 3000; // ✅ ใช้ค่า PORT จาก Railway

let weatherData = null;
let lastUpdate = 0; // เวลาที่อัปเดตล่าสุด (timestamp)

app.use(cors()); // ✅ เปิดให้ API ถูกเรียกจาก Roblox ได้

// ฟังก์ชันเช็กอายุข้อมูล
function isDataExpired() {
    const now = Date.now();
    return (now - lastUpdate) > 60 * 60 * 1000; // ✅ ถ้าเกิน 1 ชั่วโมงให้ดึงใหม่
}

// ฟังก์ชันดึงข้อมูลใหม่
async function fetchWeather() {
    try {
        const response = await axios.get('https://data.tmd.go.th/api/weather/forecast7days?province=เชียงใหม่', {
            headers: { "Accept": "application/json" }
        });

        console.log("🔍 Headers:", response.headers);
        console.log("🔍 Data Type:", typeof response.data);
        console.log("🔍 Response Preview:", response.data);

        if (typeof response.data !== "object") {
            throw new Error("API Response is not JSON. Possible HTML response.");
        }

        weatherData = response.data;
        lastUpdate = Date.now();
        console.log("✅ ดึงข้อมูลใหม่สำเร็จ:", new Date(lastUpdate).toLocaleString());
    } catch (error) {
        console.error("❌ ดึงข้อมูลพยากรณ์ล้มเหลว:", error.message);
    }
}

// 🔹 ดึงข้อมูลใหม่ทุก 1 ชั่วโมง
setInterval(fetchWeather, 60 * 60 * 1000);

fetchWeather(); // ✅ ดึงข้อมูลทันทีเมื่อเซิร์ฟเวอร์เริ่มทำงาน

// 🔹 Route `/`
app.get('/', (req, res) => {
    res.send('🌤️ API พยากรณ์อากาศพร้อมใช้งาน! ใช้ /weather หรือ /status');
});

// 🔹 Route `/status`
app.get('/status', (req, res) => {
    res.json({ status: "API is running!", lastUpdate: new Date(lastUpdate).toLocaleString() });
});

// 🔹 API ให้ข้อมูลพยากรณ์ล่าสุด
app.get('/weather', async (req, res) => {
    if (!weatherData || isDataExpired()) {
        await fetchWeather(); // ✅ ดึงข้อมูลใหม่ถ้าหมดอายุ
    }
    res.json({
        message: "พยากรณ์อากาศ 7 วัน",
        lastUpdate: new Date(lastUpdate).toLocaleString(),
        forecast: weatherData
    });
});

// 🔹 เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`🌎 Server is running on port ${port}`);
}).on("error", (err) => {
    console.error("❌ Server error:", err);
});