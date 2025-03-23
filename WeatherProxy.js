const axios = require('axios');
const express = require('express');
const cors = require('cors'); 
const app = express();

const port = process.env.PORT || 8080;
const API_KEY = "9351d1c3e74972058acb0ec6611c40eb"; 

app.use(cors());

// 🔹 เพิ่ม Route สำหรับหน้าแรก
app.get('/', (req, res) => {
    res.send('🌤️ API พยากรณ์อากาศพร้อมใช้งาน! ใช้ /weather');
});

// ฟังก์ชันดึงข้อมูลพยากรณ์อากาศ
async function fetchWeather() {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: "Chiang Mai",
                appid: API_KEY,
                units: "metric",
                lang: "th"
            }
        });

        console.log("✅ ดึงข้อมูลใหม่สำเร็จ:", response.data);
        return response.data; 
    } catch (error) {
        console.error("❌ ดึงข้อมูลล้มเหลว:", error.message);
        return null;
    }
}

// 🔹 เพิ่ม Route `/weather`
app.get('/weather', async (req, res) => {
    const weatherData = await fetchWeather();
    if (weatherData) {
        res.json(weatherData);
    } else {
        res.status(500).json({ error: "ไม่สามารถดึงข้อมูลพยากรณ์อากาศได้" });
    }
});

// 🔹 เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`🌎 Server is running on port ${port}`);
});
