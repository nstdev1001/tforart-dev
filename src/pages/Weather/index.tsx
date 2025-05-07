/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import Layout from "@/components/Layout/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Cloud,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Droplets,
  Sun,
  Wind,
} from "lucide-react";
import { useEffect, useState } from "react";

export default function WeatherApp() {
  const [city, setCity] = useState("Hanoi");
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_KEY = import.meta.env.VITE_WEATHER_API_KEY;

  const vietnamCities = [
    { name: "Hà Nội", value: "Hanoi" },
    { name: "Hồ Chí Minh", value: "Ho Chi Minh City" },
    { name: "Đà Nẵng", value: "Da Nang" },
    { name: "Hải Phòng", value: "Hai Phong" },
    { name: "Cần Thơ", value: "Can Tho" },
    { name: "Huế", value: "Hue" },
    { name: "Nha Trang", value: "Nha Trang" },
    { name: "Đà Lạt", value: "Da Lat" },
    { name: "Vũng Tàu", value: "Vung Tau" },
    { name: "Hạ Long", value: "Ha Long" },
  ];

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current weather
        const currentWeatherResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`
        );

        if (!currentWeatherResponse.ok) {
          throw new Error("Failed to fetch current weather data");
        }

        const currentWeatherData = await currentWeatherResponse.json();
        setWeatherData(currentWeatherData);

        // Fetch 7-day forecast
        const forecastResponse = await fetch(
          `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${API_KEY}`
        );

        if (!forecastResponse.ok) {
          throw new Error("Failed to fetch forecast data");
        }

        const forecastData = await forecastResponse.json();

        // Process 5-day forecast (API provides data every 3 hours)
        // Group by day and take the middle of the day entry (noon)
        const dailyForecasts = {};

        forecastData.list.forEach((item) => {
          const date = new Date(item.dt * 1000);
          const day = date.toISOString().split("T")[0];

          if (!dailyForecasts[day]) {
            dailyForecasts[day] = [];
          }

          dailyForecasts[day].push(item);
        });

        // Get one entry per day (preferably around noon)
        const processedForecast = Object.keys(dailyForecasts).map((day) => {
          const entries = dailyForecasts[day];
          // Try to find entry closest to noon
          let bestEntry = entries[0];
          let minDiff = Infinity;

          entries.forEach((entry) => {
            const date = new Date(entry.dt * 1000);
            const hoursDiff = Math.abs(date.getHours() - 12);
            if (hoursDiff < minDiff) {
              minDiff = hoursDiff;
              bestEntry = entry;
            }
          });

          return bestEntry;
        });

        // Limit to 7 days
        setForecast(processedForecast.slice(0, 7));
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchWeather();
  }, [city]);

  const getWeatherIcon = (weatherCode) => {
    // Map weather codes to icons
    if (weatherCode >= 200 && weatherCode < 300) {
      return <CloudLightning className="h-10 w-10" />;
    } else if (weatherCode >= 300 && weatherCode < 400) {
      return <CloudRain className="h-10 w-10 opacity-70" />;
    } else if (weatherCode >= 500 && weatherCode < 600) {
      return <CloudRain className="h-10 w-10" />;
    } else if (weatherCode >= 600 && weatherCode < 700) {
      return <CloudSnow className="h-10 w-10" />;
    } else if (weatherCode >= 700 && weatherCode < 800) {
      return <CloudFog className="h-10 w-10" />;
    } else if (weatherCode === 800) {
      return <Sun className="h-10 w-10 text-yellow-400" />;
    } else {
      return <Cloud className="h-10 w-10" />;
    }
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString("vi-VN", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Layout>
      <div className="weather-container max-w-[1200px] p-[20px] md:p-[50px] pt-[70px] md:pt-[100px] lg:pt-[150px] mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-3">
            Dự báo thời tiết
          </h1>
          <p className="text-lg text-gray-400">
            Để đảm bảo dự án của bạn không bị ảnh hưởng bởi thời tiết, hãy kiểm
            tra dự báo thời tiết tại đây.
          </p>
        </div>

        <div className="mb-8">
          <Select value={city} onValueChange={setCity}>
            <SelectTrigger className="w-full md:w-72 bg-gray-900 border-gray-700">
              <SelectValue placeholder="Chọn thành phố" />
            </SelectTrigger>
            <SelectContent className="bg-gray-900 border-gray-700 text-white">
              {vietnamCities.map((city) => (
                <SelectItem
                  key={city.value}
                  value={city.value}
                  className="hover:bg-gray-800 focus:bg-gray-800"
                >
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
          </div>
        )}

        {error && (
          <div className="bg-red-900 p-4 rounded-lg text-center">
            <p className="text-white">Đã xảy ra lỗi: {error}</p>
          </div>
        )}

        {!loading && !error && weatherData && (
          <>
            {/* Current Weather */}
            <Card className="mb-8 bg-gray-900 border-gray-700">
              <CardHeader>
                <CardTitle className="text-xl">
                  {vietnamCities.find((c) => c.value === city)?.name || city} -
                  Hiện tại
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center mb-4 md:mb-0">
                  {getWeatherIcon(weatherData.weather[0].id)}
                  <div className="ml-4">
                    <p className="text-5xl font-bold">
                      {Math.round(weatherData.main.temp)}°C
                    </p>
                    <p className="text-lg capitalize">
                      {weatherData.weather[0].description}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                  <div className="flex items-center">
                    <Droplets className="mr-2 h-5 w-5 text-blue-400" />
                    <span>{weatherData.main.humidity}% độ ẩm</span>
                  </div>
                  <div className="flex items-center">
                    <Wind className="mr-2 h-5 w-5 text-green-400" />
                    <span>{Math.round(weatherData.wind.speed * 3.6)} km/h</span>
                  </div>
                  <div className="flex items-center">
                    <Sun className="mr-2 h-5 w-5 text-yellow-400" />
                    <span>
                      Cảm giác: {Math.round(weatherData.main.feels_like)}°C
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Cloud className="mr-2 h-5 w-5 text-gray-400" />
                    <span>{weatherData.clouds.all}% mây</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 7-day Forecast */}
            <h2 className="text-2xl font-bold mb-4">Dự báo 7 ngày tới</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {forecast.map((day, index) => (
                <Card
                  key={index}
                  className="bg-gray-900 border-gray-700 hover:bg-gray-800 transition-colors"
                >
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">
                      {formatDate(day.dt)}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col items-center">
                        {getWeatherIcon(day.weather[0].id)}
                        <p className="text-sm mt-1 capitalize">
                          {day.weather[0].description}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold">
                          {Math.round(day.main.temp)}°C
                        </p>
                        <p className="text-sm text-gray-400">
                          {Math.round(day.main.temp_min)}° /{" "}
                          {Math.round(day.main.temp_max)}°
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 text-xs gap-y-1">
                      <div className="flex items-center">
                        <Droplets className="mr-1 h-3 w-3 text-blue-400" />
                        <span>{day.main.humidity}%</span>
                      </div>
                      <div className="flex items-center">
                        <Wind className="mr-1 h-3 w-3 text-green-400" />
                        <span>{Math.round(day.wind.speed * 3.6)} km/h</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        <footer className="mt-12 text-center text-gray-400 text-sm">
          <p>Dữ liệu thời tiết cung cấp bởi OpenWeatherMap</p>
        </footer>
      </div>
    </Layout>
  );
}
