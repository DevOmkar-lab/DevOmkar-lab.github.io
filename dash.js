// --- 1. CONFIGURATION AND INITIAL SETUP ---

const CHART_HISTORY_SIZE = 30;
const UPDATE_INTERVAL = 6000; // 1 minute update interval (60000ms)

const SOC_MIN = 0.20;
const SOC_MAX = 0.90;

let timeLabels = [];
let loadData = [];
let genData = [];
let socHistory = [];
let dailyEnergyBalance = { generated: 0, consumed: 0 };

// --- API CONFIGURATION ---
const WEATHER_API_KEY = "2d1a16338665b741fb4d4b8bacb7f283";
const WEATHER_CITY = "Jaipur, IN";

// --- COLOR PALETTE ---
const COLORS = {
    solar: '#ffc107',
    wind: '#17a2b8',
    battery: '#28a745',
    load: '#dc3545',
    genset: '#6c757d'
};

// --- CHART CONTEXT HELPERS ---
function getContext(id) {
    const canvas = document.getElementById(id);
    return canvas ? canvas.getContext('2d') : null;
}

// --- INITIALIZE CHARTS ---

const mixCtx = getContext('mixDoughnut');
let mixDoughnut = null;
if (mixCtx) {
    mixDoughnut = new Chart(mixCtx, {
        type: 'doughnut',
        data: {
            labels: ['Solar', 'Wind', 'Battery/Grid', 'Genset'],
            datasets: [{
                data: [25, 15, 50, 10],
                backgroundColor: [COLORS.solar, COLORS.wind, COLORS.battery, COLORS.genset],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { boxWidth: 10, padding: 10 } }
            }
        }
    });
}

const trendCtx = getContext('trendChart');
let trendChart = null;
if (trendCtx) {
    trendChart = new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: timeLabels,
            datasets: [
                { label: 'Total Generation (kW)', data: genData, borderColor: COLORS.battery, tension: 0.4, fill: false, borderWidth: 2 },
                { label: 'Load Demand (kW)', data: loadData, borderColor: COLORS.load, tension: 0.4, fill: false, borderWidth: 2 },
                { label: 'SOC (%)', data: socHistory.map(s => s * 100), yAxisID: 'y1', borderColor: COLORS.solar, tension: 0.4, fill: false, borderDash: [5, 5], borderWidth: 1 }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, title: { display: true, text: 'Power (kW)' } },
                y1: { type: 'linear', display: true, position: 'right', max: 100, min: 0, title: { display: true, text: 'SOC (%)' }, grid: { drawOnChartArea: false } }
            },
            plugins: { legend: { position: 'bottom' } }
        }
    });
}

const balanceCtx = getContext('balanceBarChart');
let balanceBarChart = null;
if (balanceCtx) {
    balanceBarChart = new Chart(balanceCtx, {
        type: 'bar',
        data: {
            labels: ['Generated (kWh)', 'Consumed (kWh)'],
            datasets: [{
                label: 'Daily Energy',
                data: [0, 0],
                backgroundColor: [COLORS.battery, COLORS.load],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, title: { display: true, text: 'Energy (kWh)' } } },
            plugins: { legend: { display: false } }
        }
    });
}

// --- 2. WEATHER FETCH LOGIC (API + FALLBACK) ---

async function fetchWeatherData() {
    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${WEATHER_CITY}&appid=${WEATHER_API_KEY}&units=metric`
        );
        const data = await response.json();

        return {
            temp: data.main.temp,
            feelsLike: data.main.feels_like,
            windSpeed: data.wind.speed,
            irradiance: Math.floor(Math.random() * (900 - 100) + 100),
            humidity: data.main.humidity,
            cloudCover: data.clouds.all,
            windDir: data.wind.deg,
            pressure: data.main.pressure,
            sunrise: new Date(data.sys.sunrise * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            sunset: new Date(data.sys.sunset * 1000).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            description: data.weather[0].description
        };
    } catch (error) {
        console.warn("Weather API failed — using simulated data instead.");
        return simulateWeatherData();
    }
}

// --- Simulated weather (fallback mode) ---
function simulateWeatherData() {
    const temp = (Math.random() * (42 - 30) + 30).toFixed(1);
    const feelsLike = (parseFloat(temp) + Math.random() * 2).toFixed(1);
    const windSpeed = (Math.random() * 10 + 3).toFixed(1);
    const irradiance = Math.floor(Math.random() * (900 - 100) + 100);
    const humidity = Math.floor(Math.random() * 50 + 40);
    const cloudCover = Math.floor(Math.random() * 60);
    const windDir = Math.floor(Math.random() * 360);
    const pressure = Math.floor(Math.random() * (1020 - 990) + 990);
    const sunrise = '06:05 AM';
    const sunset = '06:15 PM';
    const description = cloudCover > 40 ? 'Partly Cloudy' : 'Clear Sky';

    return { temp, feelsLike, windSpeed, irradiance, humidity, cloudCover, windDir, pressure, sunrise, sunset, description };
}

// --- 3. TELEMETRY SIMULATION ---

function fetchTelemetryData() {
    const soc = Math.random() * (0.95 - 0.15) + 0.15;
    const load = Math.floor(Math.random() * (25 - 5) + 5);
    const pv = Math.max(0, Math.floor(Math.random() * (20 - 5) + 5) * (soc > 0.85 ? 0.6 : 1));
    const wind = Math.floor(Math.random() * 10);
    const totalGenInstant = pv + wind;

    let gensetPower = 0;
    let status = 'System Online';
    let statusClass = 'online';
    let batteryText = 'Idle';
    let netPower = totalGenInstant - load;

    if (netPower > 0) {
        if (soc < SOC_MAX) batteryText = 'Charging';
        else { status = 'Curtailment'; statusClass = 'warning'; }
    } else if (netPower < 0) {
        if (soc > SOC_MIN) batteryText = 'Discharging';
        else { gensetPower = Math.abs(netPower); status = 'Genset Active'; statusClass = 'alert'; }
    }

    const totalGenerationIncludingGenset = totalGenInstant + gensetPower;
    const intervalHours = UPDATE_INTERVAL / (1000 * 60 * 60);
    dailyEnergyBalance.generated += totalGenerationIncludingGenset * intervalHours;
    dailyEnergyBalance.consumed += load * intervalHours;

    return {
        pv_power: pv,
        wind_power: wind,
        load_demand: load,
        genset_power: gensetPower,
        total_generation: totalGenerationIncludingGenset,
        battery_soc: soc,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        system_status: status,
        status_class: statusClass,
        battery_text: batteryText
    };
}

// --- 4. UI UPDATE LOGIC ---

function updateKpiCards(data) {
    if (document.getElementById('kpi-solar')) {
        document.getElementById('kpi-solar').textContent = `${data.pv_power.toFixed(1)} kW`;
        document.getElementById('kpi-wind').textContent = `${data.wind_power.toFixed(1)} kW`;
        document.getElementById('kpi-load').textContent = `${data.load_demand.toFixed(1)} kW`;
        document.getElementById('kpi-soc-percent').textContent = `${Math.round(data.battery_soc * 100)}%`;
        document.getElementById('battery-status-text').textContent = data.battery_text;

        const statusIndicator = document.getElementById('system-status-indicator');
        document.getElementById('system-status-text').textContent = data.system_status;
        statusIndicator.className = `system-status-indicator ${data.status_class}`;

        document.getElementById('kpi-timestamp').textContent = data.timestamp;
    }
}

function updateWeatherCard(data) {
    if (document.getElementById('weather-temp')) {
        document.getElementById('weather-temp').textContent = `${data.temp}°C`;
        document.getElementById('weather-feels').textContent = `${data.feelsLike}°C`;
        document.getElementById('weather-desc').textContent = data.description;
        document.getElementById('weather-irradiance').textContent = `${data.irradiance} W/m²`;
        document.getElementById('weather-wind-speed').textContent = `${data.windSpeed} m/s`;
        document.getElementById('weather-humidity').textContent = `${data.humidity}%`;
        document.getElementById('weather-cloud').textContent = `${data.cloudCover}%`;
        document.getElementById('weather-wind-dir').textContent = `${data.windDir}°`;

        if (document.getElementById('weather-pressure')) {
            document.getElementById('weather-pressure').textContent = `${data.pressure} hPa`;
        }
        if (document.getElementById('weather-sunrise')) {
            document.getElementById('weather-sunrise').textContent = data.sunrise;
        }
        if (document.getElementById('weather-sunset')) {
            document.getElementById('weather-sunset').textContent = data.sunset;
        }
    }
}

function updateMixChart(data) {
    if (mixDoughnut) {
        const totalLoadOrGen = data.load_demand + data.total_generation || 1;

        const solarMix = (data.pv_power / totalLoadOrGen) * 100;
        const windMix = (data.wind_power / totalLoadOrGen) * 100;
        const gensetMix = (data.genset_power / totalLoadOrGen) * 100;
        const batteryGridMix = 100 - solarMix - windMix - gensetMix;

        mixDoughnut.data.datasets[0].data = [
            Math.max(0, solarMix),
            Math.max(0, windMix),
            Math.max(0, batteryGridMix),
            Math.max(0, gensetMix)
        ];
        mixDoughnut.update();
    }
}

function updateTrendChart(data) {
    if (trendChart) {
        if (timeLabels.length >= CHART_HISTORY_SIZE) {
            timeLabels.shift();
            loadData.shift();
            genData.shift();
            socHistory.shift();
        }
        timeLabels.push(data.timestamp.slice(0, 5));
        loadData.push(data.load_demand);
        genData.push(data.total_generation);
        socHistory.push(data.battery_soc);
        trendChart.update();
    }
}

function updateBalanceBarChart() {
    if (balanceBarChart) {
        balanceBarChart.data.datasets[0].data = [
            dailyEnergyBalance.generated.toFixed(1),
            dailyEnergyBalance.consumed.toFixed(1)
        ];
        balanceBarChart.update();
    }
}

// --- 5. MAIN DASHBOARD LOOP ---

async function updateDashboard() {
    const mainData = fetchTelemetryData();
    const weatherData = await fetchWeatherData();

    updateKpiCards(mainData);
    updateWeatherCard(weatherData);
    updateMixChart(mainData);
    updateTrendChart(mainData);
    updateBalanceBarChart();

    setTimeout(updateDashboard, UPDATE_INTERVAL);
}

// --- 6. LOGOUT + USERNAME HANDLING ---

function handleLogout() {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("username");
    sessionStorage.clear();
    window.location.href = "index.html";
}

document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

    const usernameDisplay = document.getElementById('usernameDisplay');
    if (usernameDisplay && localStorage.getItem("username")) {
        usernameDisplay.textContent = localStorage.getItem("username");
    }
});

