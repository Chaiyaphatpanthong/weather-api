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
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                appid: API_KEY,
                units: "metric",
                lang: "th"
            }
        });
        console.log(`✅ ดึงข้อมูลสำเร็จ: ${city}`);
        return { city, ...response.data };
    } catch (error) {
        console.error(`❌ ดึงข้อมูลล้มเหลวสำหรับ ${city}:`, error.message);
        return { city, error: "ไม่สามารถดึงข้อมูลพยากรณ์อากาศได้" };
    }
}

// 🔹 เพิ่ม Route `/weather?cities=Chiang Mai,Bangkok,Phuket`
app.get('/weather', async (req, res) => {
    const cities = req.query.cities ? req.query.cities.split(',') : ["Chiang Mai"]; // ค่าเริ่มต้นคือเชียงใหม่
    const weatherPromises = cities.map(fetchWeather);
    
    const weatherData = await Promise.all(weatherPromises);
    res.json(weatherData);
});

// 🔹 เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`🌎 Server is running on port ${port}`);
});
