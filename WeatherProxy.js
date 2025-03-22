const axios = require('axios');
const express = require('express');
const app = express();
const port = 3000;

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
        weatherData = response.data;
        lastUpdate = Date.now();
        console.log("✅ ดึงข้อมูลใหม่สำเร็จ:", new Date(lastUpdate).toLocaleString());
    } catch (error) {
        console.error("❌ ดึงข้อมูลพยากรณ์ล้มเหลว:", error);
    }
}

// ดึงข้อมูลใหม่ทุก 1 ชั่วโมง (โดยไม่ต้องรอการเรียก API)
setInterval(fetchWeather, 60 * 60 * 1000);
fetchWeather(); // ดึงข้อมูลทันทีเมื่อเริ่มต้นเซิร์ฟเวอร์

// API ให้ข้อมูลพยากรณ์ล่าสุด (ดึงใหม่ถ้าหมดอายุ)
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

app.listen(port, () => {
    console.log(`🌎 Server is running on http://localhost:${port}`);
});
