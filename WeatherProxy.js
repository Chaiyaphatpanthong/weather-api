const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 8080;
const API_KEY = "9351d1c3e74972058acb0ec6611c40eb";

app.use(cors());

app.get('/', (req, res) => {
    res.send('🌤️ API พยากรณ์อากาศพร้อมใช้งาน! ใช้ /weather?cities=Chiang Mai,Bangkok,Phuket');
});

// ฟังก์ชันดึงข้อมูลพยากรณ์อากาศของเมืองเดียว
async function fetchWeather(city) {
    try {
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                appid: API_KEY,
                units: "metric",
                lang: "th"
            }
        });
        const lat = weatherResponse.data.coord.lat;
        const lon = weatherResponse.data.coord.lon;

        // ดึงข้อมูลคุณภาพอากาศ (ฝุ่น) ด้วย Air Pollution API
        const airQualityResponse = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution`, {
            params: {
                lat: lat,
                lon: lon,
                appid: API_KEY
            }
        });

        // ตรวจสอบค่าฝุ่นก่อนส่งกลับ
        const airQuality = airQualityResponse.data.list[0] ? airQualityResponse.data.list[0].components : {};

        console.log(`✅ [SUCCESS] ดึงข้อมูลสำเร็จสำหรับ: ${city}`);

        // รวมข้อมูลสภาพอากาศและค่าฝุ่น
        return {
            city,
            weather: weatherResponse.data,
            airQuality: airQuality // ส่งข้อมูลฝุ่นที่ตรวจสอบแล้ว
        };

    } catch (error) {
        console.error(`❌ [ERROR] ดึงข้อมูลล้มเหลวสำหรับ ${city}: ${error.message}`);
        return { city, error: "ไม่สามารถดึงข้อมูลพยากรณ์อากาศและฝุ่นได้" };
    }
}

// 🔹 Route `/weather?cities=Chiang Mai,Bangkok,Phuket`
app.get('/weather', async (req, res) => {
    if (!req.query.cities) {
        return res.status(400).json({ error: "กรุณาระบุค่าพารามิเตอร์ cities เช่น /weather?cities=Chiang Mai,Bangkok,Phuket" });
    }

    const cities = req.query.cities.split(',');
    console.log(`📌 [REQUEST] รับคำขอพยากรณ์อากาศและฝุ่นสำหรับ: ${cities.join(', ')}`);

    const weatherPromises = cities.map(fetchWeather);
    const weatherData = await Promise.all(weatherPromises);

    console.log("📦 [RESPONSE] ส่งข้อมูล JSON กลับไปยังลูกค้า");
    res.json(weatherData);
});

// 🔹 เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`🌎 [SERVER] กำลังทำงานบนพอร์ต ${port}`);
});
