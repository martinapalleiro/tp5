async function fetchData() {
    const response = await fetch('https://apidemo.geoeducacion.com.ar/api/testing/pearson/1');
    const data = await response.json();
    return data.data[0].valores;
}

function calculatePearson(x, y) {
    const n = x.length; // Número de elementos
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    // Sumar los elementos en un solo bucle
    for (let i = 0; i < n; i++) {
        sumX += x[i];        // Suma de x
        sumY += y[i];        // Suma de y
    }

    // Calcular medias
    const mediaX = sumX / n; // Media de x
    const mediaY = sumY / n; // Media de y

    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;

    // Calcular el numerador y los denominadores
    for (let i = 0; i < n; i++) {
        numerator += (x[i] - mediaX) * (y[i] - mediaY); // Covarianza
        denominatorX += (x[i] - mediaX) ** 2; // Varianza de x
        denominatorY += (y[i] - mediaY) ** 2; // Varianza de y
    }

    // Calcular el coeficiente de correlación
    const denominator = Math.sqrt(denominatorX * denominatorY);

    if (denominator === 0) {
        return 0; // Evitar división por cero
    } else {
        return numerator / denominator; // Retornar el coeficiente
    }
}

function createCard(variable1, variable2, correlation, description) {
    return `
        <div class="card">
            <h2>${variable1} vs ${variable2}</h2>
            <p>Coeficiente de Pearson: ${correlation.toFixed(2)}</p>
            <p>${description}</p>
        </div>
    `;
}

async function displayResults() {
    const data = await fetchData();
    const variables = {
        presion: data.map(d => d.presion),
        temperatura: data.map(d => d.temperatura),
        humedad: data.map(d => d.humedad),
        viento: data.map(d => d.viento)
    };

    const pairs = [
        { v1: 'Presión', v2: 'Temperatura', correlation: calculatePearson(variables.presion, variables.temperatura) },
        { v1: 'Presión', v2: 'Humedad', correlation: calculatePearson(variables.presion, variables.humedad) },
        { v1: 'Presión', v2: 'Velocidad del viento', correlation: calculatePearson(variables.presion, variables.viento) },
        { v1: 'Temperatura', v2: 'Humedad', correlation: calculatePearson(variables.temperatura, variables.humedad) },
        { v1: 'Temperatura', v2: 'Velocidad del viento', correlation: calculatePearson(variables.temperatura, variables.viento) },
        { v1: 'Humedad', v2: 'Velocidad del viento', correlation: calculatePearson(variables.humedad, variables.viento) }
    ];

    const resultsContainer = document.getElementById('results');
    pairs.forEach(pair => {
        let description;
        if (pair.correlation > 0.5) {
            description = 'Fuerte correlación positiva.';
        } else if (pair.correlation > 0.3) {
            description = 'Correlación moderada positiva.';
        } else if (pair.correlation > 0.1) {
            description = 'Correlación débil positiva.';
        } else if (pair.correlation > 0) {
            description = 'Correlación inexistente positiva.';
        } else if (pair.correlation < -0.5) {
            description = 'Fuerte correlación negativa.';
        } else if (pair.correlation < -0.3) {
            description = 'Correlación moderada negativa.';
        } else if (pair.correlation < -0.1) {
            description = 'Correlación débil negativa.';
        } else if (pair.correlation < 0) {
            description = 'Correlación inexistente negativa.';
        } else {
            description = 'No hay correlación significativa.';
        }
        
        resultsContainer.innerHTML += createCard(pair.v1, pair.v2, pair.correlation, description);
    });
}

displayResults();
