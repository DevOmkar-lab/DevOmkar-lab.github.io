// Cloudflare Worker: weather-proxy.js
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const city = url.searchParams.get("city") || "Jaipur";

    // Replace with your actual OpenWeatherMap API key
    const API_KEY = env.2d1a16338665b741fb4d4b8bacb7f283; // stored as secret
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;

    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        return new Response(JSON.stringify({ error: "Failed to fetch weather data" }), { status: 500 });
      }

      const data = await response.json();

      const weather = {
        temp: data.main.temp,
        feelsLike: data.main.feels_like,
        windSpeed: data.wind.speed,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        cloudCover: data.clouds.all,
        description: data.weather[0].description,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset
      };

      return new Response(JSON.stringify(weather), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), { status: 500 });
    }
  }
};
