// Dark/Light Mode Toggle
const themeToggleButton = document.getElementById('theme-toggle');
themeToggleButton.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const currentTheme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
  localStorage.setItem('theme', currentTheme);
});

// Set theme based on localStorage
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-mode');
  }
});

// Statistical Calculations
document.getElementById("stats-form").addEventListener("submit", function (event) {
  event.preventDefault();
  calculate();
});

document.getElementById("clear-btn").addEventListener("click", function () {
  document.getElementById("numbers").value = "";
  document.querySelectorAll(".results span").forEach(span => (span.textContent = "-"));
  if (chartInstance) chartInstance.destroy();
});

let chartInstance = null;

// Custom Calculation Function
const calculate = () => {
  const value = document.querySelector('#numbers').value;
  const array = value.split(/,\s*/g);
  const numbers = array.map(num => Number(num)).filter(el => !isNaN(el));

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

  document.querySelector("#mean").textContent = mean;
  document.querySelector("#median").textContent = median;
  document.querySelector("#mode").textContent = mode;
  document.querySelector("#range").textContent = range;
  document.querySelector("#variance").textContent = variance;
  document.querySelector("#standardDeviation").textContent = standardDeviation;
};

// Statistical Helper Functions
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

// Generate Graphs (Bar, Pie, Line, Histogram)
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

// Data Export (CSV and Copy Link)
document.getElementById('download-csv').addEventListener('click', function() {
  let numbers = document.getElementById("numbers").value.split(",").map(num => parseFloat(num.trim())).filter(num => !isNaN(num));
  if (numbers.length === 0) return alert('No data to export.');

  const csvContent = "data:text/csv;charset=utf-8," + numbers.join(",") + "\n";
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "statistics_data.csv");
  link.click();
});

document.getElementById('copy-link').addEventListener('click', function() {
  const link = window.location.href + "?data=" + encodeURIComponent(document.getElementById("numbers").value);
  navigator.clipboard.writeText(link).then(() => alert('Link copied to clipboard!'));
});
