const axios = require('axios');
const express = require('express');
const cors = require('cors');
const app = express();

const port = process.env.PORT || 8080;
const API_KEY = "9351d1c3e74972058acb0ec6611c40eb"; // OpenWeather API

app.use(cors());

app.get('/', (req, res) => {
    res.send('🌤️ API พร้อมใช้งาน! ใช้ /weather?cities=Chiang Mai,Bangkok,Phuket');
});

// 🔹 ดึงข้อมูลสภาพอากาศและพิกัดละติจูด-ลองจิจูด
async function fetchWeather(city) {
    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather`, {
            params: { q: city, appid: API_KEY, units: "metric", lang: "th" }
        });
        console.log(`✅ ดึงข้อมูลสภาพอากาศสำเร็จ: ${city}`);
        return {
            city,
            weather: response.data,
            coord: response.data.coord // ⬅️ ดึงค่าพิกัดของเมือง
        };
    } catch (error) {
        console.error(`❌ ดึงข้อมูลสภาพอากาศล้มเหลวสำหรับ ${city}:`, error.message);
        return { city, error: "ไม่สามารถดึงข้อมูลพยากรณ์อากาศได้" };
    }
}

// 🔹 ดึงค่าฝุ่น PM2.5 / AQI ใช้พิกัด GPS
async function fetchAirQuality(coord, city) {
    if (!coord) return { city, error: "ไม่มีพิกัด GPS" };

    try {
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/air_pollution`, {
            params: { lat: coord.lat, lon: coord.lon, appid: API_KEY }
        });
        console.log(`✅ ดึงข้อมูลคุณภาพอากาศสำเร็จ: ${city}`);
        return { city, air_quality: response.data };
    } catch (error) {
        console.error(`❌ ดึงข้อมูลคุณภาพอากาศล้มเหลวสำหรับ ${city}:`, error.message);
        return { city, error: "ไม่สามารถดึงข้อมูลคุณภาพอากาศได้" };
    }
}

// 🔹 ดึงข้อมูลน้ำทะเล (จำลอง)
async function fetchMarineData(city) {
    const marineData = {
        wave_height: Math.random() * 2.5,
        sea_temperature: Math.random() * 10 + 25,
        tide_level: Math.random() * 3
    };
    console.log(`✅ ดึงข้อมูลทะเลสำเร็จ: ${city}`);
    return { city, marine: marineData };
}

// 🔹 รวมข้อมูลทั้งหมด
app.get('/weather', async (req, res) => {
    const cities = req.query.cities ? req.query.cities.split(',') : ["Chiang Mai"];

    const weatherResults = await Promise.all(cities.map(fetchWeather));
    
    const airQualityPromises = weatherResults.map(result => fetchAirQuality(result.coord, result.city));
    const marinePromises = cities.map(fetchMarineData);

    const airQualityResults = await Promise.all(airQualityPromises);
    const marineResults = await Promise.all(marinePromises);

    // รวมข้อมูลทุกหมวดให้แต่ละเมือง
    const combinedData = cities.map((city, index) => ({
        city,
        weather: weatherResults[index].weather || null,
        air_quality: airQualityResults[index].air_quality || null,
        marine: marineResults[index].marine || null
    }));

    res.json(combinedData);
});

// 🔹 เริ่มเซิร์ฟเวอร์
app.listen(port, () => {
    console.log(`🌎 Server is running on port ${port}`);
});
