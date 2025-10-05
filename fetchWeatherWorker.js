export default {
  async fetch(request) {
    const url = new URL(request.url);
    const city = url.searchParams.get("city") || "Jaipur";

    const apiKey = "2d1a16338665b741fb4d4b8bacb7f283"; // Keep it hidden here!
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    try {
      const res = await fetch(apiUrl);
      const data = await res.json();

      return new Response(JSON.stringify({
        temp: data.main.temp,
        feelsLike: data.main.feels_like,
        windSpeed: data.wind.speed,
        humidity: data.main.humidity,
        pressure: data.main.pressure,
        cloudCover: data.clouds.all,
        description: data.weather[0].description,
        sunrise: data.sys.sunrise,
        sunset: data.sys.sunset
      }), {
        headers: { "Content-Type": "application/json" }
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "Weather fetch failed" }), { status: 500 });
    }
  }
};
