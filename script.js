let chartInstance = null; // Declare chartInstance outside the function to keep track of the chart.

// Custom Calculation Function (with Regression and Filtering)
const calculate = () => {
  const value = document.querySelector('#numbers').value;
  const array = value.split(/,\s*/g);
  let numbers = array.map(num => Number(num)).filter(el => !isNaN(el));

  // Remove outliers before processing
  numbers = removeOutliers(numbers);

  if (numbers.length === 0) {
    document.getElementById("error-message").textContent = "⚠️ Please enter valid numbers!";
    return;
  }

  document.getElementById("error-message").textContent = "";

  const mean = getMean(numbers);
  const median = getMedian(numbers);
  const mode = getMode(numbers);
  const range = getRange(numbers);
  const variance = getVariance(numbers);
  const standardDeviation = getStandardDeviation(numbers);

  // Display results
  document.querySelector("#mean").textContent = mean;
  document.querySelector("#median").textContent = median;
  document.querySelector("#mode").textContent = mode;
  document.querySelector("#range").textContent = range;
  document.querySelector("#variance").textContent = variance;
  document.querySelector("#standardDeviation").textContent = standardDeviation;
};

// Regression calculation (linear)
const calculateRegression = (numbers) => {
  const n = numbers.length;
  const meanX = getMean([...Array(n).keys()]); // Mean of indices
  const meanY = getMean(numbers);

  let numerator = 0;
  let denominator = 0;

  for (let i = 0; i < n; i++) {
    numerator += (i - meanX) * (numbers[i] - meanY);
    denominator += (i - meanX) ** 2;
  }

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  return { slope, intercept };
};

// Chart generation with regression line (linear regression chart)
function generateLinearRegressionChart() {
  const value = document.querySelector('#numbers').value;
  const array = value.split(/,\s*/g);
  let numbers = array.map(num => Number(num)).filter(el => !isNaN(el));

  if (numbers.length === 0) {
    document.getElementById("error-message").textContent = "⚠️ Please enter valid numbers!";
    return;
  }

  const regression = calculateRegression(numbers);

  const ctx = document.getElementById("chart").getContext("2d");
  if (chartInstance) chartInstance.destroy();

  let data = {
    labels: numbers.map((_, i) => `Data ${i + 1}`),
    datasets: [
      {
        label: "Values",
        data: numbers.map((value, idx) => ({ x: idx, y: value })), // Map numbers for scatter plot
        backgroundColor: "#36a2eb",
        borderColor: "#0056b3",
        borderWidth: 1,
        pointRadius: 5,
        type: 'scatter',
        fill: false
      },
      {
        label: "Regression Line",
        data: numbers.map((_, idx) => ({
          x: idx,
          y: regression.slope * idx + regression.intercept
        })),
        borderColor: 'rgba(255, 99, 132, 0.8)',
        type: 'line',
        fill: false
      }
    ]
  };

  chartInstance = new Chart(ctx, {
    type: 'scatter',
    data: data,
    options: {
      scales: {
        x: { title: { display: true, text: 'Index' } },
        y: { title: { display: true, text: 'Values' } }
      }
    }
  });
}

function generateChart(type) {
    let input = document.getElementById("numbers").value;
    let numbers = input.split(",").map(num => parseFloat(num.trim())).filter(num => !isNaN(num));
  
    if (numbers.length === 0) {
      document.getElementById("error-message").textContent = "⚠️ Please enter valid numbers!";
      return;
    }
  
    const ctx = document.getElementById("chart").getContext("2d");
    if (chartInstance) chartInstance.destroy();
  
    let data = {
      labels: numbers.map((_, i) => `Data ${i + 1}`),
      datasets: [{
        label: "Values",
        data: numbers,
        backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0"],
        borderColor: "#0056b3",
        borderWidth: 1
      }]
    };
  
    chartInstance = new Chart(ctx, {
      type: type === "histogram" ? "bar" : type,
      data: data
    });
  }

// Statistical Helper Functions (same as before)
const getMean = (array) => array.reduce((acc, el) => acc + el, 0) / array.length;
const getMedian = (array) => {
  const sorted = array.toSorted((a, b) => a - b);
  const median = sorted.length % 2 === 0
    ? getMean([sorted[sorted.length / 2], sorted[sorted.length / 2 - 1]])
    : sorted[Math.floor(sorted.length / 2)];
  return median;
};
const getMode = (array) => {
  const counts = {};
  array.forEach((el) => {
    counts[el] = (counts[el] || 0) + 1;
  });
  if (new Set(Object.values(counts)).size === 1) {
    return null;
  }
  const highest = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  const mode = Object.keys(counts).filter((el) => counts[el] === counts[highest]);

  return mode.join(", ");
};
const getRange = (array) => {
  return Math.max(...array) - Math.min(...array);
};
const getVariance = (array) => {
  const mean = getMean(array);
  const variance = array.reduce((acc, el) => {
    const difference = el - mean;
    const squared = difference ** 2;
    return acc + squared;
  }, 0) / array.length;
  return variance;
};
const getStandardDeviation = (array) => {
  const variance = getVariance(array);
  return Math.sqrt(variance);
};

// Outlier Removal using IQR method
const removeOutliers = (numbers) => {
  const sorted = numbers.slice().sort((a, b) => a - b);
  const q1 = getMedian(sorted.slice(0, Math.floor(sorted.length / 2)));
  const q3 = getMedian(sorted.slice(Math.ceil(sorted.length / 2)));
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return numbers.filter(num => num >= lowerBound && num <= upperBound);
};
