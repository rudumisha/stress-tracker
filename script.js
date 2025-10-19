// Дані для графіка
let stressData = JSON.parse(localStorage.getItem("stressData")) || [];

// Відображення графіка
const ctx = document.getElementById('stressChart');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'],
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

// Пройти тест
document.getElementById('startTest').addEventListener('click', () => {
  let score = 0;
  const questions = [
    "Чи відчуваєш ти напруження сьогодні?",
    "Чи було складно зосередитися?",
    "Чи погано ти спав(-ла) минулої ночі?",
    "Чи був(-ла) ти роздратованим(-ою)?",
    "Чи відчуваєш втому без причини?"
  ];

  questions.forEach(q => {
    const answer = prompt(q + " (0 - ні, 1 - трохи, 2 - так)");
    score += Number(answer);
  });

  const stressLevel = Math.round((score / (questions.length * 2)) * 10);
  document.getElementById("stressValue").innerText = `${stressLevel}/10`;

  // Зберегти результат
  stressData.push(stressLevel);
  if (stressData.length > 7) stressData.shift(); // тільки останні 7 днів
  updateChart();

  // Історія
  const date = new Date().toLocaleDateString('uk-UA');
  const li = document.createElement('li');
  li.textContent = `${date}: рівень стресу ${stressLevel}/10`;
  document.getElementById("historyList").prepend(li);
});
