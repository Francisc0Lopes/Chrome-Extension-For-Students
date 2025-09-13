document.addEventListener("DOMContentLoaded", () => {
  // --- ELEMENTOS ---
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");
  const notifyBtn = document.getElementById("notifyBtn");
  const taskSelect = document.getElementById("taskSelect");
  const timerDisplay = document.getElementById("timer");
  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");
  const refreshBtn = document.getElementById("refreshAll");

  let pomodoroTime = 10; // testar com 10 segundos, depois 25*60
  let timerInterval = null;

  // --- FUNÇÕES AUX ---
  function updateTimerDisplay() {
    const minutes = Math.floor(pomodoroTime / 60).toString().padStart(2, "0");
    const seconds = (pomodoroTime % 60).toString().padStart(2, "0");
    timerDisplay.textContent = `${minutes}:${seconds}`;
  }

  function addTaskToUI(task) {
    const li = document.createElement("li");
    li.textContent = task;
    const removeBtn = document.createElement("button");
    removeBtn.textContent = "❌";
    removeBtn.style.marginLeft = "10px";
    removeBtn.addEventListener("click", () => {
      li.remove();
      chrome.storage.local.get(["tasks", "pomodoros"], res => {
        const tasks = res.tasks || [];
        const updatedTasks = tasks.filter(t => t !== task);
        const pomodoros = res.pomodoros || {};
        delete pomodoros[task];
        chrome.storage.local.set({ tasks: updatedTasks, pomodoros }, updateTaskSelect);
      });
    });
    li.appendChild(removeBtn);
    taskList.appendChild(li);
  }

  function updateTaskSelect() {
    chrome.storage.local.get(["tasks", "pomodoros"], res => {
      const tasks = res.tasks || [];
      const pomodoros = res.pomodoros || {};
      taskSelect.innerHTML = '<option value="">--Seleciona tarefa--</option>';
      tasks.forEach(t => {
        const option = document.createElement("option");
        option.value = t;
        option.textContent = `${t} (${pomodoros[t] || 0} Pomodoros)`;
        taskSelect.appendChild(option);
      });
    });
  }


  // Função para atualizar os contadores de produtividade (delegada ao dashboard.js)
  function updateCountersFromDashboard() {
    if (typeof window.updateDashboardCounters === 'function') {
      window.updateDashboardCounters();
    }
  }

  // --- EVENTOS ---
  addTaskBtn.addEventListener('click', () => {
    const task = taskInput.value.trim();
    if (!task) return;
    chrome.storage.local.get(["tasks"], res => {
      const tasks = res.tasks || [];
      tasks.push(task);
      chrome.storage.local.set({ tasks }, () => {
        addTaskToUI(task);
        updateTaskSelect();
        taskInput.value = '';
      });
    });
  });

  notifyBtn.addEventListener('click', () => {
    chrome.storage.local.get(['tasks'], res => {
      const tasks = res.tasks || [];
      const message = tasks.length > 0 ? `Tens ${tasks.length} tarefas hoje:\n${tasks.join("\n")}` : 'Sem tarefas pendentes hoje! 🎉';
      chrome.runtime.sendMessage({ action: 'notify', title: '📚 Student Buddy', message });
    });
  });

  startBtn.addEventListener('click', () => {
    const selectedTask = taskSelect.value;
    if (!selectedTask) { alert("Seleciona uma tarefa antes de iniciar o Pomodoro!"); return; }
    if (timerInterval === null) {
      timerInterval = setInterval(() => {
        pomodoroTime--;
        updateTimerDisplay();
        if (pomodoroTime <= 0) {
          clearInterval(timerInterval); timerInterval = null;
          chrome.storage.local.get(['pomodoros', 'pomodorosHistory'], res => {
            const pomodoros = res.pomodoros || {};
            pomodoros[selectedTask] = (pomodoros[selectedTask] || 0) + 1;
            const history = res.pomodorosHistory || [];
            history.push({ task: selectedTask, timestamp: new Date().toISOString() });
            chrome.storage.local.set({ pomodoros, pomodorosHistory: history }, () => { if (typeof window.updateDashboardCounters === 'function') window.updateDashboardCounters(); updateTaskSelect(); });
          });
          chrome.runtime.sendMessage({ action: 'notify', title: `⏰ Pomodoro Finalizado: ${selectedTask}`, message: 'O tempo de estudo terminou! Faça uma pausa.' });
          pomodoroTime = 10; updateTimerDisplay();
        }
      }, 1000);
    }
  });

  resetBtn.addEventListener('click', () => {
    clearInterval(timerInterval); timerInterval = null; pomodoroTime = 10; updateTimerDisplay();
  });

  refreshBtn.addEventListener('click', () => { if (typeof window.updateDashboardCounters === 'function') window.updateDashboardCounters(); });

  // Botão para inserir dados de teste
  document.getElementById('btnTestData').addEventListener('click', () => {
    // Gera 10 pomodoros: 3 hoje, 3 esta semana, 2 este mês, 2 meses anteriores
    const now = new Date();
    const history = [];
    // Hoje
    for (let i = 0; i < 3; i++) history.push({ task: 'Tarefa Teste', timestamp: new Date(now).toISOString() });
    // Esta semana (dias anteriores)
    for (let i = 1; i <= 3; i++) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      history.push({ task: 'Tarefa Teste', timestamp: d.toISOString() });
    }
    // Este mês (dias anteriores à semana)
    for (let i = 8; i <= 9; i++) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      history.push({ task: 'Tarefa Teste', timestamp: d.toISOString() });
    }
    // Meses anteriores
    for (let i = 35; i <= 36; i++) {
      const d = new Date(now); d.setDate(now.getDate() - i);
      history.push({ task: 'Tarefa Teste', timestamp: d.toISOString() });
    }
    chrome.storage.local.set({ pomodorosHistory: history }, () => {
      if (typeof window.updateDashboardCounters === 'function') window.updateDashboardCounters();
      desenharGrafico('diario');
      desenharGrafico('semanal');
      desenharGrafico('mensal');
      // Atualiza gráfico de tarefas
      const countsByTask = { 'Tarefa Teste': history.length };
      if (window.drawPieChart) window.drawPieChart('pomodoroChartTask', Object.keys(countsByTask), Object.values(countsByTask));
    });
  });
  updateTaskSelect();
  updateTimerDisplay();
  if (typeof window.updateDashboardCounters === 'function') window.updateDashboardCounters();

  // Função para desenhar gráfico de acordo com o tipo
  function desenharGrafico(tipo) {
    chrome.storage.local.get(["pomodorosHistory"], res => {
      const history = res.pomodorosHistory || [];
      let labels = [], data = [];
      if (tipo === 'diario') {
        const countsByDay = {};
        history.forEach(e => {
          const day = new Date(e.timestamp).toLocaleDateString('pt-BR');
          countsByDay[day] = (countsByDay[day] || 0) + 1;
        });
        labels = Object.keys(countsByDay).sort();
        data = labels.map(l => countsByDay[l]);
      } else if (tipo === 'semanal') {
        const countsByWeek = {};
        history.forEach(e => {
          const d = new Date(e.timestamp);
          // Semana ISO: ano + número da semana
          const year = d.getFullYear();
          const week = Math.ceil((((d - new Date(year, 0, 1)) / 86400000) + new Date(year, 0, 1).getDay() + 1) / 7);
          const key = `${year}-S${week}`;
          countsByWeek[key] = (countsByWeek[key] || 0) + 1;
        });
        labels = Object.keys(countsByWeek).sort();
        data = labels.map(l => countsByWeek[l]);
      } else if (tipo === 'mensal') {
        const countsByMonth = {};
        history.forEach(e => {
          const d = new Date(e.timestamp);
          const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
          countsByMonth[key] = (countsByMonth[key] || 0) + 1;
        });
        labels = Object.keys(countsByMonth).sort();
        data = labels.map(l => countsByMonth[l]);
      }
      if (window.drawBarChart) window.drawBarChart('pomodoroChart', labels, data);
    });
  }

  // Botões de gráfico
  document.getElementById('btnGraficoDiario').addEventListener('click', () => desenharGrafico('diario'));
  document.getElementById('btnGraficoSemanal').addEventListener('click', () => desenharGrafico('semanal'));
  document.getElementById('btnGraficoMensal').addEventListener('click', () => desenharGrafico('mensal'));

  // Desenhar gráfico diário por padrão ao abrir
  desenharGrafico('diario');

  // Pomodoros por tarefa (pizza)
  chrome.storage.local.get(["pomodorosHistory"], res => {
    const history = res.pomodorosHistory || [];
    const countsByTask = {};
    history.forEach(e => {
      countsByTask[e.task] = (countsByTask[e.task] || 0) + 1;
    });
    const taskLabels = Object.keys(countsByTask);
    const taskData = Object.values(countsByTask);
    if (window.drawPieChart) window.drawPieChart('pomodoroChartTask', taskLabels, taskData);
  });
});
