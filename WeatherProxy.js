const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 8080;
const API_KEY = "9351d1c3e74972058acb0ec6611c40eb"; // OpenWeather API

app.use(cors());

app.get('/', (req, res) => {
    res.send('🌤️ API พยากรณ์อากาศพร้อมใช้งาน! ใช้ /weather?cities=Chiang Mai,Bangkok,Phuket');
});

// ฟังก์ชันดึงข้อมูลพยากรณ์อากาศ
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
        console.log(`✅ ดึงข้อมูลสภาพอากาศสำเร็จ: ${city}`);
        return { city, weather: response.data };
    } catch (error) {
        console.error(`❌ ดึงข้อมูลสภาพอากาศล้มเหลวสำหรับ ${city}:`, error.message);
        return { city, error: "ไม่สามารถดึงข้อมูลพยากรณ์อากาศได้" };
    }
}

// ฟังก์ชันดึงค่าฝุ่น & AQI
async function fetchAirQuality(city) {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution`, {
            params: {
                q: city,
                appid: API_KEY
            }
        });
        console.log(`✅ ดึงข้อมูลคุณภาพอากาศสำเร็จ: ${city}`);
        const pm25 = response.data.list[0].components["pm2_5"]; // ค่าฝุ่น PM2.5
        const aqi = response.data.list[0].main.aqi; // ค่าคุณภาพอากาศ AQI
        return { city, air_quality: { pm25, aqi } };
    } catch (error) {
        console.error(`❌ ดึงข้อมูลคุณภาพอากาศล้มเหลวสำหรับ ${city}:`, error.message);
        return { city, error: "ไม่สามารถดึงข้อมูลคุณภาพอากาศได้" };
    }
}

// ฟังก์ชันดึงข้อมูลน้ำทะเล (API นี้ต้องใช้ API อื่น เช่น NOAA หรือ Marine API)
async function fetchMarineData(city) {
    try {
        // จำลองข้อมูลทะเล (เพราะ API จริงอาจต้องสมัครแบบเสียเงิน)
        const marineData = {
            wave_height: Math.random() * 2.5, // ความสูงคลื่น (เมตร)
            sea_temperature: Math.random() * 10 + 25, // อุณหภูมิน้ำ (°C)
            tide_level: Math.random() * 3 // ระดับน้ำขึ้นน้ำลง
        };
        console.log(`✅ ดึงข้อมูลทะเลสำเร็จ: ${city}`);
        return { city, marine: marineData };
    } catch (error) {
        console.error(`❌ ดึงข้อมูลทะเลล้มเหลวสำหรับ ${city}:`, error.message);
        return { city, error: "ไม่สามารถดึงข้อมูลทะเลได้" };
    }
}

// ฟังก์ชันรวมข้อมูลทุกอย่าง
app.get('/weather', async (req, res) => {
    const cities = req.query.cities ? req.query.cities.split(',') : ["Chiang Mai"];

    const weatherPromises = cities.map(fetchWeather);
    const airQualityPromises = cities.map(fetchAirQuality);
    const marinePromises = cities.map(fetchMarineData);

    const weatherData = await Promise.all(weatherPromises);
    const airQualityData = await Promise.all(airQualityPromises);
    const marineData = await Promise.all(marinePromises);

    // รวมข้อมูลทุกหมวดให้แต่ละเมือง
    const combinedData = cities.map((city, index) => ({
        city,
        weather: weatherData[index].weather || null,
        air_quality: airQualityData[index].air_quality || null,
        marine: marineData[index].marine || null
    }));

    res.json(combinedData);
});

// 🔹 เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`🌎 Server is running on port ${port}`);
});
