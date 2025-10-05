document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    // Demo credentials
    const demoUser = "guest";
    const demoPass = "guest123";

    const msgEl = document.getElementById('loginMessage');

    if (username === demoUser && password === demoPass) {
        // Save login info
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("username", username);
        msgEl.textContent = "✅ Login successful! Redirecting to dashboard...";
        msgEl.className = 'login-success';

        // small delay so message is visible
        setTimeout(() => {
            window.location.href = "dash.html";
        }, 900);
    } else {
        msgEl.textContent = "❌ Invalid Username or Password. Try again!";
        msgEl.className = 'login-error';
    }
});
