// Este arquivo é responsável apenas por desenhar gráficos simples sem Chart.js.
// Funções para desenhar gráficos customizados podem ser adicionadas aqui.

// Exemplo: gráfico de barras simples para pomodoros por dia
function drawBarChart(canvasId, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const max = Math.max(...data, 1);
    const barWidth = 30;
    const gap = 20;
    const chartHeight = canvas.height - 40;
    const chartWidth = canvas.width;

    // Eixo Y
    ctx.beginPath();
    ctx.moveTo(40, 10);
    ctx.lineTo(40, chartHeight);
    ctx.lineTo(chartWidth - 10, chartHeight);
    ctx.strokeStyle = '#333';
    ctx.stroke();

    // Barras
    labels.forEach((label, i) => {
        const x = 50 + i * (barWidth + gap);
        const y = chartHeight - (data[i] / max) * (chartHeight - 30);
        const h = (data[i] / max) * (chartHeight - 30);
        ctx.fillStyle = 'rgba(54, 162, 235, 0.6)';
        ctx.fillRect(x, y, barWidth, h);
        ctx.fillStyle = '#333';
        ctx.fillText(label, x, chartHeight + 15);
        ctx.fillText(data[i], x + barWidth / 2 - 5, y - 5);
    });
}

// Exemplo: gráfico de pizza simples para pomodoros por tarefa
function drawPieChart(canvasId, labels, data) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const total = data.reduce((a, b) => a + b, 0);
    let startAngle = -Math.PI / 2;
    const colors = [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(255, 206, 86, 0.6)',
        'rgba(75, 192, 192, 0.6)',
        'rgba(153, 102, 255, 0.6)',
        'rgba(255, 159, 64, 0.6)',
        'rgba(199, 199, 199, 0.6)'
    ];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const radius = Math.min(cx, cy) - 30;
    data.forEach((val, i) => {
        const angle = (val / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, startAngle, startAngle + angle);
        ctx.closePath();
        ctx.fillStyle = colors[i % colors.length];
        ctx.fill();
        // Legenda
        const midAngle = startAngle + angle / 2;
        const lx = cx + Math.cos(midAngle) * (radius + 20);
        const ly = cy + Math.sin(midAngle) * (radius + 20);
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText(labels[i], lx, ly);
        startAngle += angle;
    });
}

// Exporte as funções para uso em outros scripts
window.drawBarChart = drawBarChart;
window.drawPieChart = drawPieChart;
