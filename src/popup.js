document.addEventListener("DOMContentLoaded", () => {
  // === ELEMENTOS ===
  const taskInput = document.getElementById("taskInput");
  const addTaskBtn = document.getElementById("addTaskBtn");
  const taskList = document.getElementById("taskList");
  const notifyBtn = document.getElementById("notifyBtn");
  const taskSelect = document.getElementById("taskSelect");
  const timerDisplay = document.getElementById("timer");
  const startBtn = document.getElementById("startBtn");
  const resetBtn = document.getElementById("resetBtn");

  let pomodoroTime = 10;//25 * 60;
  let timerInterval = null;

  // --- FUNÇÕES ---
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
      chrome.storage.local.get(["tasks", "pomodoros"], (result) => {
        const tasks = result.tasks || [];
        const updatedTasks = tasks.filter((t) => t !== task);
        const pomodoros = result.pomodoros || {};
        delete pomodoros[task];
        chrome.storage.local.set({ tasks: updatedTasks, pomodoros }, updateTaskSelect);
      });
    });

    li.appendChild(removeBtn);
    taskList.appendChild(li);
  }

  function updateTaskSelect() {
    chrome.storage.local.get(["tasks", "pomodoros"], (result) => {
      const tasks = result.tasks || [];
      const pomodoros = result.pomodoros || {};
      taskSelect.innerHTML = '<option value="">--Seleciona tarefa--</option>';
      tasks.forEach((task) => {
        const option = document.createElement("option");
        option.value = task;
        option.textContent = `${task} (${pomodoros[task] || 0} Pomodoros)`;
        taskSelect.appendChild(option);
      });
    });
  }

  // --- CARREGAR TAREFAS ---
  chrome.storage.local.get(["tasks"], (result) => {
    if (result.tasks) result.tasks.forEach(addTaskToUI);
    updateTaskSelect();
  });

  // --- EVENTOS ---
  addTaskBtn.addEventListener("click", () => {
    const task = taskInput.value.trim();
    if (!task) return;
    chrome.storage.local.get(["tasks"], (result) => {
      const tasks = result.tasks || [];
      tasks.push(task);
      chrome.storage.local.set({ tasks }, () => {
        addTaskToUI(task);
        updateTaskSelect();
        taskInput.value = "";
      });
    });
  });

  notifyBtn.addEventListener("click", () => {
    chrome.storage.local.get(["tasks"], (result) => {
      const tasks = result.tasks || [];
      const message = tasks.length > 0
        ? `Tens ${tasks.length} tarefas hoje:\n${tasks.join("\n")}`
        : "Sem tarefas pendentes hoje! 🎉";

      chrome.runtime.sendMessage({ action: "notify", title: "📚 Student Buddy", message });
    });
  });

  // --- POMODORO TIMER ---
  startBtn.addEventListener("click", () => {
    const selectedTask = taskSelect.value;
    if (!selectedTask) { alert("Seleciona uma tarefa antes de iniciar o Pomodoro!"); return; }

    if (timerInterval === null) {
      timerInterval = setInterval(() => {
        pomodoroTime--;
        updateTimerDisplay();

        if (pomodoroTime <= 0) {
          clearInterval(timerInterval);
          timerInterval = null;

          chrome.storage.local.get(["pomodoros", "pomodorosHistory"], (result) => {
            const pomodoros = result.pomodoros || {};
            pomodoros[selectedTask] = (pomodoros[selectedTask] || 0) + 1;

            const history = result.pomodorosHistory || [];
            history.push({ task: selectedTask, timestamp: new Date().toISOString() });

            chrome.storage.local.set({ pomodoros, pomodorosHistory: history }, updateTaskSelect);
          });

          chrome.runtime.sendMessage({
            action: "notify",
            title: `⏰ Pomodoro Finalizado: ${selectedTask}`,
            message: "O tempo de estudo terminou! Faça uma pausa."
          });

          pomodoroTime = 25 * 60;
          updateTimerDisplay();
        }
      }, 1000);
    }
  });

  resetBtn.addEventListener("click", () => {
    clearInterval(timerInterval);
    timerInterval = null;
    pomodoroTime = 25 * 60;
    updateTimerDisplay();
  });

  // Inicializar display
  updateTimerDisplay();
});
