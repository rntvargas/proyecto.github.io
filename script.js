document.getElementById("calculate-btn").addEventListener("click", () => {
    const dataX = document.getElementById("data-x").value.split(",").map(Number);
    const dataY = document.getElementById("data-y").value.split(",").map(Number);
    const alpha = parseFloat(document.getElementById("alpha").value);
    const alternative = document.getElementById("alternative").value;

    if (dataX.length !== dataY.length || dataX.some(isNaN) || dataY.some(isNaN)) {
        alert("Por favor, ingrese datos válidos y asegúrese de que ambas muestras tengan el mismo tamaño.");
        return;
    }

    // Calcular diferencias
    const differences = dataX.map((x, i) => x - dataY[i]);

    // Media de las diferencias
    const meanDiff = differences.reduce((a, b) => a + b, 0) / differences.length;

    // Varianza y desviación estándar de las diferencias
    const varianceDiff = differences
        .map(d => Math.pow(d - meanDiff, 2))
        .reduce((a, b) => a + b, 0) / (differences.length - 1);

    const stdDevDiff = Math.sqrt(varianceDiff);

    // Validar que la desviación estándar no sea 0
    if (stdDevDiff === 0) {
        alert("Error: Las diferencias entre las muestras tienen varianza cero. Revise los datos.");
        return;
    }

    // Estadístico t
    const tStat = meanDiff / (stdDevDiff / Math.sqrt(differences.length));

    // Grados de libertad
    const df = differences.length - 1;

    // Calcular valor crítico y decisión
    const pValue = calcPValue(tStat, df, alternative);
    const decision = pValue < alpha ? "Rechazar H₀" : "No Rechazar H₀";

    // Mostrar resultados
    document.getElementById("result-text").innerHTML = `
        <strong>Estadístico t:</strong> ${tStat.toFixed(4)}<br>
        <strong>p-Valor:</strong> ${pValue.toFixed(4)}<br>
        <strong>Decisión:</strong> ${decision}
    `;

    // Generar gráfica
    plotChart(tStat, df);
});

// Función para calcular p-valor
function calcPValue(t, df, alternative) {
    const cdf = jStat.studentt.cdf(t, df);

    if (alternative === "left") {
        return cdf;
    } else if (alternative === "right") {
        return 1 - cdf;
    } else {
        return 2 * Math.min(cdf, 1 - cdf);
    }
}

// Generar gráfica
function plotChart(tStat, df) {
    const ctx = document.getElementById("chart").getContext("2d");

    // Crear datos para la gráfica
    const dataPoints = [];
    const labels = [];
    for (let t = -4; t <= 4; t += 0.1) {
        labels.push(t.toFixed(1));
        dataPoints.push(jStat.studentt.pdf(t, df));
    }

    // Crear gráfico
    new Chart(ctx, {
        type: "line",
        data: {
            labels,
            datasets: [
                {
                    label: "Distribución T-Student",
                    data: dataPoints,
                    borderColor: "blue",
                    borderWidth: 2,
                    fill: false,
                },
            ],
        },
        options: {
            plugins: {
                legend: {
                    display: true,
                    position: "top",
                },
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: "t",
                    },
                },
                y: {
                    title: {
                        display: true,
                        text: "f(t)",
                    },
                },
            },
        },
    });
}


