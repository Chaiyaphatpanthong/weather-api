const axios = require('axios');
const express = require('express');
const cors = require('cors'); 
const app = express();

const port = process.env.PORT || 8080;
const API_KEY = "9351d1c3e74972058acb0ec6611c40eb"; 

app.use(cors());

app.get('/', (req, res) => {
    res.send('🌤️ API พยากรณ์อากาศของเชียงใหม่พร้อมใช้งาน! ใช้ /weather');
});

// ฟังก์ชันดึงข้อมูลพยากรณ์อากาศของเชียงใหม่
async function fetchWeather() {
    const city = "Chiang Mai";  
    try {
        const weatherResponse = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: {
                q: city,
                appid: API_KEY,
                units: "metric",
                lang: "th"
            }
        });

        const { coord } = weatherResponse.data; // ดึงพิกัดจากข้อมูลพยากรณ์อากาศ
        console.log(`✅ [SUCCESS] ดึงข้อมูลพยากรณ์อากาศสำเร็จสำหรับ: ${city}`);

        // ดึงข้อมูลค่าฝุ่น PM2.5 โดยใช้พิกัดจาก weather API
        const airResponse = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution`, {
            params: {
                lat: coord.lat,
                lon: coord.lon,
                appid: API_KEY
            }
        });

        const pm25 = airResponse.data.list[0].components.pm2_5; // ค่าฝุ่น PM2.5
        console.log(`✅ [SUCCESS] ดึงข้อมูลค่าฝุ่นสำเร็จ PM2.5 = ${pm25} µg/m³`);

        return { 
            city, 
            ...weatherResponse.data, 
            pm25 
        };
    } catch (error) {
        console.error(`❌ [ERROR] ดึงข้อมูลล้มเหลว: ${error.message}`);
        return { city, error: "ไม่สามารถดึงข้อมูลพยากรณ์อากาศได้" };
    }
}

// 🔹 Route `/weather`
app.get('/weather', async (req, res) => {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    console.log(`📌 [REQUEST] IP: ${ip} | อุปกรณ์: ${userAgent} | รับคำขอพยากรณ์อากาศของเชียงใหม่`);

    const weatherData = await fetchWeather();

    console.log("📦 [RESPONSE] ส่งข้อมูล JSON กลับไปยังลูกค้า");
    res.json(weatherData);
});

// 🔹 เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`🌎 [SERVER] กำลังทำงานบนพอร์ต ${port}`);
});
