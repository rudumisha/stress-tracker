// Отримуємо збережені дані
let stressData = JSON.parse(localStorage.getItem("stressData")) || [];

// DOM елементи
const stressValue = document.getElementById("stressValue");
const historyList = document.getElementById("historyList");
const modal = document.getElementById("testModal");
const questionText = document.getElementById("questionText");
const answers = document.querySelectorAll(".answer");

// Питання
const questions = [
  "Чи відчуваєш ти напруження сьогодні?",
  "Чи було складно зосередитися?",
  "Чи погано ти спав(-ла) минулої ночі?",
  "Чи був(-ла) ти роздратованим(-ою)?",
  "Чи відчуваєш втому без причини?"
];

let score = 0;
let currentQuestion = 0;

// === Функції ===

// Отримати назву дня українською
function getDayName(date) {
  const days = ['Нд', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  return days[date.getDay()];
}

// Вибрати останні 7 днів
function getLast7DaysData() {
  const today = new Date();
  const result = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toLocaleDateString('uk-UA');

    const record = stressData.find(item => item.date === dateStr);
    result.push(record ? record.value : null);
  }

  return result;
}

// Ініціалізація графіка
const ctx = document.getElementById('stressChart');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'],
    datasets: [{
      label: 'Рівень стресу',
      data: getLast7DaysData(),
      borderColor: '#f39c12',
      backgroundColor: 'rgba(243,156,18,0.2)',
      fill: true,
      tension: 0.3
    }]
  },
  options: {
    scales: {
      y: { min: 0, max: 10 }
    }
  }
});

// Оновити графік
function updateChart() {
  chart.data.datasets[0].data = getLast7DaysData();
  chart.update();
  localStorage.setItem("stressData", JSON.stringify(stressData));
}

// Оновити історію
function updateHistory() {
  historyList.innerHTML = "";
  stressData.slice(-7).reverse().forEach(item => {
    const li = document.createElement("li");
    li.textContent = `${item.date} (${getDayName(new Date(item.date))}): ${item.value}/10`;
    historyList.appendChild(li);
  });
}

// Почати тест
document.getElementById("startTest").addEventListener("click", () => {
  score = 0;
  currentQuestion = 0;
  questionText.innerText = questions[currentQuestion];
  modal.classList.remove("hidden");
});

// Обробка натискань у тесті
answers.forEach(btn => {
  btn.addEventListener("click", () => {
    score += Number(btn.dataset.value);
    currentQuestion++;

    if (currentQuestion < questions.length) {
      questionText.innerText = questions[currentQuestion];
    } else {
      modal.classList.add("hidden");
      finishTest();
    }
  });
});

// Завершення тесту
function finishTest() {
  const stressLevel = Math.round((score / (questions.length * 2)) * 10);
  const today = new Date();
  const dateStr = today.toLocaleDateString('uk-UA');

  stressValue.innerText = `${stressLevel}/10`;

  // Зберегти (оновити, якщо сьогодні вже є запис)
  const existing = stressData.find(item => item.date === dateStr);
  if (existing) existing.value = stressLevel;
  else stressData.push({ date: dateStr, value: stressLevel });

  updateChart();
  updateHistory();

  // 💡 Порада залежно від результату
  let tip = "";
  if (stressLevel <= 3) tip = "Чудово! Продовжуй у тому ж дусі 🌞";
  else if (stressLevel <= 6) tip = "Спробуй прогулянку або музику для розслаблення 🌿";
  else tip = "Твій рівень стресу високий 😟. Зроби паузу й подихай глибше 🧘";

  setTimeout(() => alert(tip), 300);
}

// При запуску оновити інтерфейс
updateChart();
updateHistory();

// === Нагадування ===
const reminder = document.getElementById("reminder");
const reminderBtn = document.getElementById("reminderBtn");
const closeReminder = document.getElementById("closeReminder");

// Запуск тесту з нагадування
reminderBtn.addEventListener("click", () => {
  reminder.classList.add("hidden");
  document.getElementById("startTest").click();
});

// Закрити нагадування
closeReminder.addEventListener("click", () => {
  reminder.classList.add("hidden");
});

// Перевірка часу (кожні 30 секунд)
setInterval(() => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();

  // Показати нагадування о 20:00, якщо користувач ще не проходив тест сьогодні
  const today = new Date().toLocaleDateString('uk-UA');
  const alreadyDone = stressData.some(item => item.date === today);

  if (hours === 20 && minutes === 0 && !alreadyDone) {
    reminder.classList.remove("hidden");
  }
}, 30000); // перевірка кожні 30 секунд


// Дозвіл на сповіщення
if (Notification.permission !== "granted") {
    Notification.requestPermission();
  }
  
  function showNotification() {
    if (Notification.permission === "granted") {
      new Notification("Нагадування 🌿", {
        body: "Час пройти тест на рівень стресу!",
        icon: "https://cdn-icons-png.flaticon.com/512/733/733585.png"
      });
    }
  }
  
  // Виклик сповіщення одночасно з нагадуванням
  if (hours === 20 && minutes === 0 && !alreadyDone) {
    reminder.classList.remove("hidden");
    showNotification();
  }
  