let timer;
let timeLeft = 60;
let currentQuestionIndex = -1;
let quizData = [];
let scores = {};
let timerRunning = false;

async function loadQuiz() {
  try {
    const response = await fetch("quiz.json");
    quizData = await response.json();
  } catch (err) {
    alert("⚠️ Failed to load quiz.json. Make sure the file exists!");
  }
}

function startTimer() {
  timerRunning = true;
  document.getElementById("timerBtn").textContent = "Stop Timer";
  timeLeft = 60;
  document.getElementById("timer").textContent = "Time Left: 60s";

  timer = setInterval(() => {
    timeLeft--;
    document.getElementById("timer").textContent = "Time Left: " + timeLeft + "s";
    if (timeLeft <= 0) stopTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timer);
  timerRunning = false;
  document.getElementById("timerBtn").textContent = "Start Timer";
}

function loadRandomQuestion() {
  stopTimer();
  timeLeft = 60;
  document.getElementById("timer").textContent = "Time Left: 60s";
  currentQuestionIndex = Math.floor(Math.random() * quizData.length);
  document.getElementById("question").textContent = quizData[currentQuestionIndex].question;
  document.getElementById("answer").value = "";
}

function checkAnswer() {
  stopTimer();
  let student = document.getElementById("studentName").value.trim();
  let ans = document.getElementById("answer").value.trim();

  if (!student) {
    alert("⚠️ Please enter your name first!");
    return;
  }

  let correctAnswer = quizData[currentQuestionIndex].answer;
  if (!scores[student]) scores[student] = 0;

  if (ans.toLowerCase() === correctAnswer.toLowerCase()) {
    scores[student]++;
    alert("✅ Correct! The answer is: " + correctAnswer);
  } else {
    scores[student]--;
    alert("❌ Wrong! The correct answer is: " + correctAnswer);
  }

  updateLeaderboard();
}

function updateLeaderboard() {
  let lb = document.getElementById("leaderboard");
  lb.style.display = "block";
  lb.innerHTML = "<h3>Leaderboard</h3>";
  for (let player in scores) {
    lb.innerHTML += `<p>${player}: ${scores[player]} points</p>`;
  }
}

// Event Listeners
document.getElementById("timerBtn").addEventListener("click", () => {
  if (timerRunning) {
    stopTimer();
  } else {
    startTimer();
  }
});

document.getElementById("checkBtn").addEventListener("click", checkAnswer);
document.getElementById("nextBtn").addEventListener("click", loadRandomQuestion);

document.getElementById("startQuizBtn").addEventListener("click", () => {
  document.getElementById("startQuizBtn").style.display = "none";
  document.getElementById("quizBox").style.display = "block";
  loadRandomQuestion();
});

loadQuiz();
