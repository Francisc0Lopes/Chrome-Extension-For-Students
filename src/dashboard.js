// Função global para atualizar os contadores de produtividade
window.updateDashboardCounters = function () {
  chrome.storage.local.get(["pomodorosHistory"], res => {
    const history = res.pomodorosHistory || [];
    const now = new Date();
    const todayStr = now.toLocaleDateString('pt-BR');
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // domingo como início da semana
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    let todayCount = 0, weekCount = 0, monthCount = 0;
    history.forEach(e => {
      const d = new Date(e.timestamp);
      if (d.toLocaleDateString('pt-BR') === todayStr) todayCount++;
      if (d >= startOfWeek) weekCount++;
      if (d >= startOfMonth) monthCount++;
    });
    if (document.getElementById('todayCount')) document.getElementById('todayCount').textContent = todayCount;
    if (document.getElementById('weekCount')) document.getElementById('weekCount').textContent = weekCount;
    if (document.getElementById('monthCount')) document.getElementById('monthCount').textContent = monthCount;
    if (document.getElementById('totalCount')) document.getElementById('totalCount').textContent = history.length;
  });
}
