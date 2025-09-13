document.addEventListener("DOMContentLoaded", () => {
  const dailyCtx = document.getElementById("pomodoroChartDaily").getContext("2d");
  const taskCtx = document.getElementById("pomodoroChartTask").getContext("2d");

  chrome.storage.local.get(["pomodorosHistory"], (result) => {
    const history = result.pomodorosHistory || [];

    // --- Gráfico diário ---
    const countsByDay = {};
    history.forEach(entry => {
      const date = new Date(entry.timestamp).toLocaleDateString();
      countsByDay[date] = (countsByDay[date] || 0) + 1;
    });
    const dailyLabels = Object.keys(countsByDay).sort();
    const dailyData = Object.values(countsByDay);

    new Chart(dailyCtx, {
      type: 'bar',
      data: {
        labels: dailyLabels,
        datasets: [{ label: 'Pomodoros por dia', data: dailyData, backgroundColor: 'rgba(54, 162, 235, 0.6)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1 }]
      },
      options: { responsive: false, scales: { y: { beginAtZero: true } } }
    });

    // --- Gráfico por tarefa ---
    const countsByTask = {};
    history.forEach(entry => {
      countsByTask[entry.task] = (countsByTask[entry.task] || 0) + 1;
    });
    const taskLabels = Object.keys(countsByTask);
    const taskData = Object.values(countsByTask);

    new Chart(taskCtx, {
      type: 'bar',
      data: {
        labels: taskLabels,
        datasets: [{ label: 'Pomodoros por tarefa', data: taskData, backgroundColor: 'rgba(255, 99, 132, 0.6)', borderColor: 'rgba(255, 99, 132, 1)', borderWidth: 1 }]
      },
      options: { responsive: false, scales: { y: { beginAtZero: true } } }
    });
  });
});
