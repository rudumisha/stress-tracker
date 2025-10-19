// Дані для графіка
let stressData = JSON.parse(localStorage.getItem("stressData")) || [];
let score = 0;
let currentQuestion = 0;

const questions = [
  "Чи відчуваєш ти напруження сьогодні?",
  "Чи було складно зосередитися?",
  "Чи погано ти спав(-ла) минулої ночі?",
  "Чи був(-ла) ти роздратованим(-ою)?",
  "Чи відчуваєш втому без причини?"
];

// Елементи DOM
const modal = document.getElementById("testModal");
const questionText = document.getElementById("questionText");
const answers = document.querySelectorAll(".answer");
const stressValue = document.getElementById("stressValue");
const historyList = document.getElementById("historyList");

const ctx = document.getElementById('stressChart');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Пн','Вт','Ср','Чт','Пт','Сб','Нд'],
    datasets: [{
      label: 'Рівень стресу',
      data: stressData,
      borderColor: '#f39c12',
      backgroundColor: 'rgba(243, 156, 18, 0.2)',
      fill: true,
      tension: 0.3
    }]
  }
});

function updateChart() {
  chart.data.datasets[0].data = stressData;
  chart.update();
  localStorage.setItem("stressData", JSON.stringify(stressData));
}

// Відкрити тест
document.getElementById('startTest').addEventListener('click', () => {
  score = 0;
  currentQuestion = 0;
  questionText.innerText = questions[currentQuestion];
  modal.classList.remove("hidden");
});

// Вибір відповіді
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

// Результат тесту
function finishTest() {
  const stressLevel = Math.round((score / (questions.length * 2)) * 10);
  stressValue.innerText = `${stressLevel}/10`;

  stressData.push(stressLevel);
  if (stressData.length > 7) stressData.shift();
  updateChart();

  const date = new Date().toLocaleDateString('uk-UA');
  const li = document.createElement('li');
  li.textContent = `${date}: рівень стресу ${stressLevel}/10`;
  historyList.prepend(li);

  // 💡 Порада залежно від результату
  let tip = "";
  if (stressLevel <= 3) tip = "Чудово! Продовжуй у тому ж дусі 🌞";
  else if (stressLevel <= 6) tip = "Спробуй відпочити або прогулятись на свіжому повітрі 🌿";
  else tip = "Зроби паузу. Глибоко вдихни і видихни 🧘";

  setTimeout(() => alert(tip), 200);
}