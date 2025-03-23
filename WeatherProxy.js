const axios = require('axios');
const express = require('express');
const cors = require('cors'); // ✅ เปิดให้ใช้งานจาก Roblox
const app = express();

const port = process.env.PORT || 3000;
const API_KEY = "9351d1c3e74972058acb0ec6611c40eb"; // 🔑 ใส่ API Key ที่สมัครได้

app.use(cors());

// ฟังก์ชันดึงข้อมูลพยากรณ์อากาศ
async function fetchWeather() {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: "Chiang Mai", // เปลี่ยนจังหวัดที่ต้องการ
                appid: API_KEY,
                units: "metric", // อุณหภูมิเป็นองศาเซลเซียส
                lang: "th" // ภาษาไทย
            }
        });

        console.log("✅ ดึงข้อมูลใหม่สำเร็จ:", response.data);
        return response.data; 
    } catch (error) {
        console.error("❌ ดึงข้อมูลล้มเหลว:", error.message);
        return null;
    }
}

// API Route
app.get('/weather', async (req, res) => {
    const weatherData = await fetchWeather();
    if (weatherData) {
        res.json(weatherData);
    } else {
        res.status(500).json({ error: "ไม่สามารถดึงข้อมูลพยากรณ์อากาศได้" });
    }
});

app.listen(port, () => {
    console.log(`🌎 Server is running on port ${port}`);
});
