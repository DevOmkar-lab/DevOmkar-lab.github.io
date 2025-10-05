// Redirect to login if user is not logged in
if (!localStorage.getItem("isLoggedIn")) {
    window.location.href = "index.html";
}
// --- 1. CONFIGURATION AND INITIAL SETUP ---
const UPDATE_INTERVAL = 4000; 

const SOC_MIN = 0.20; 
const SOC_MAX = 0.90; 

const COLORS = {
    // Standard Palette
    battery: '#28a745',  // Green (used for good status/metrics)
    load: '#dc3545',     // Red
    monitoring: '#17a2b8', // Teal
    warning: '#ffc107',  // Yellow

    // Health/Orchestration Specific Colors
    health_good: '#28a745',
    health_fair: '#ffc107',
    health_poor: '#dc3545',
    monitoring_zone: '#17a2b8',
    load_shedding: '#dc3545', 
    solar_zone: '#ffc107', 
    wind_zone: '#95c6d3',
};

let radarChart = null;
let systemHealthChart = null;


// --- 2. UTILITY FUNCTIONS ---

function getContext(id) {
    const canvas = document.getElementById(id);
    return canvas ? canvas.getContext('2d') : null;
}

function fetchTelemetryData() {
    // Simulates required real-time telemetry data for header status
    const soc = Math.random() * (0.95 - 0.15) + 0.15; 
    
    let status = 'System Online';
    let statusClass = 'online';

    if (soc < SOC_MIN + 0.05) { // Slightly above min for alert warning
        status = 'Critical SOC Low';
        statusClass = 'alert';
    } else if (soc > SOC_MAX - 0.05) {
        status = 'High SOC/Curtailing';
        statusClass = 'warning';
    }

    return {
        battery_soc: soc,
        system_status: status,
        status_class: statusClass,
    };
}


// --- 3. CHART INITIALIZATION (ANALYTICS PAGE) ---

/**
 * Initializes the Performance Radar Chart (Performance Radar Analysis).
 * LOGIC: Scores the system based on key project evaluation criteria.
 */
function initializeRadarChart() {
    const ctx = getContext('performanceRadarChart');
    if (!ctx) return;

    // Simulate current scores based on evaluation criteria
    const scores = [
        Math.floor(Math.random() * (99 - 95) + 95), // Reliability (>99.5%)
        Math.floor(Math.random() * (95 - 75) + 75), // Renewable Fraction (>70%)
        Math.floor(Math.random() * (85 - 60) + 60), // Cost Savings (LCOE)
        Math.floor(Math.random() * (95 - 85) + 85), // Efficiency (Roundtrip)
        Math.floor(Math.random() * (99 - 90) + 90)  // System Availability
    ];

    radarChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['Reliability', 'Renewable Fraction', 'Cost Savings', 'Efficiency', 'Availability'],
            datasets: [{
                label: 'Current Performance Score (%)',
                data: scores, 
                backgroundColor: 'rgba(40, 167, 69, 0.2)', 
                borderColor: COLORS.battery,
                pointBackgroundColor: COLORS.battery,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                r: {
                    angleLines: { color: '#ccc' },
                    grid: { color: '#eee' },
                    pointLabels: { font: { size: 12 } },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: { beginAtZero: true, stepSize: 20 }
                }
            },
            plugins: {
                legend: { display: true, position: 'bottom' }
            }
        }
    });
}

/**
 * Initializes the System Orchestration View (Doughnut/Pie Chart).
 * LOGIC: Shows how the energy management is allocated across system priorities.
 */
function initializeSystemHealthChart() {
    const ctx = getContext('systemHealthChart');
    if (!ctx) return;

    // Simulate allocation/control focus (not component health, but orchestration)
    systemHealthChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Load Management', 'Battery Control', 'Genset Management', 'Grid Export/Import', 'Renewable Forecasting'],
            datasets: [{
                label: 'System Orchestration Focus',
                data: [30, 25, 10, 15, 20], // Simulated allocation percentage
                backgroundColor: [
                    COLORS.load, 
                    COLORS.battery, 
                    COLORS.genset, 
                    COLORS.monitoring_zone,
                    COLORS.warning
                ],
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right' },
                title: { display: false }
            }
        }
    });
}


// --- 4. ANALYTICS PAGE SPECIFIC FUNCTIONS ---

/**
 * Updates the main system status indicator in the header.
 */
function updateSystemStatus(data) {
    const statusIndicator = document.getElementById('system-status-indicator');
    if (statusIndicator) {
        document.getElementById('system-status-text').textContent = data.system_status;
        statusIndicator.className = `system-status-indicator ${data.status_class}`; 
    }
}

/**
 * Handles the click event for 'Apply' buttons.
 */
function handleApplyClick(event) {
    const button = event.target;
    if (!button.classList.contains('btn-apply')) return;

    const insightItem = button.closest('.insight-item');
    const action = button.getAttribute('data-action');
    const updateStatusElement = document.getElementById('ml-update-status');
    
    if (!insightItem || button.disabled) return;

    let message = "";
    
    // Simulation of Apply Logic based on data-action
    if (action === 'apply-battery') {
        message = `✅ Applied: Battery charging schedule adjusted to solar forecast.`;
    } else if (action === 'apply-load-shift') {
        message = `✅ Applied: HVAC lab schedule shifted to align with wind surge.`;
    } else if (action === 'apply-export') {
        message = `✅ Applied: Grid export activated for the 12-1 PM window.`;
    } else if (action === 'apply') { // For general recommendations
        message = `✅ Applied: Recommendation activated successfully.`;
    } else {
        message = `Error: Unknown action applied.`;
    }

    // 1. Visually mark the insight as 'Applied'
    insightItem.style.backgroundColor = '#f7fff7'; 
    button.disabled = true;
    button.textContent = 'Applied';
    button.style.backgroundColor = '#1e7e34';

    // 2. Display persistent confirmation message
    if (updateStatusElement) {
        updateStatusElement.textContent = message;
        updateStatusElement.style.display = 'block';
        
        // Hide the message after a few seconds
        setTimeout(() => {
            updateStatusElement.style.display = 'none';
        }, 8000);
    }
}


/**
 * Initializes the Analytics Page: Sets charts, listeners, and dynamic content.
 */
function initializeAnalyticsPage() {
    // 1. Initialize the charts into their placeholders
    initializeRadarChart();
    initializeSystemHealthChart();

    const mlPanel = document.getElementById('ml-insights-panel');
    if (mlPanel) {
        // 2. Attach event listener for the "Apply" buttons
        mlPanel.addEventListener('click', handleApplyClick);
        
        // 3. Set dynamic header (Simulated Dataset)
        const header = document.querySelector('.analytics-header-row h1');
        if (header) {
             header.textContent = `AI-Powered Analytics & Insights - Dataset: ${localStorage.getItem('currentDataset') || 'Rajasthan Pilot Data'}`;
        }
    }
    
    // Attach listener to the general anomaly/recommendation grid buttons
    document.querySelector('.anomaly-recommendation-grid')?.addEventListener('click', handleApplyClick);
}


/**
 * The main application loop for analytics.js.
 */
function updateAnalyticsPageLoop() {
    // 1. Fetch data for the header status
    const mainData = fetchTelemetryData();

    // 2. Update status bar
    updateSystemStatus(mainData); 

    // Schedule the next update
    setTimeout(updateAnalyticsPageLoop, UPDATE_INTERVAL);
}

// Start the application only if the analytics panel is present
document.addEventListener('DOMContentLoaded', () => {
    // Ensure this runs only for the analytics page
    if (document.querySelector('.analytics-header-row')) {
        initializeAnalyticsPage();
        updateAnalyticsPageLoop(); 
    }
});

function handleLogout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    sessionStorage.clear();
    window.location.href = "index.html";
}

