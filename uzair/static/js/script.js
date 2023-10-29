document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();

    var form = document.getElementById('uploadForm');
    var formData = new FormData(form);
    var loading = document.getElementById('loading');
    var result = document.getElementById('result');

    // Start Loading Animation
    startLoadingAnimation(loading);

    fetch('/upload', {
        method: 'POST',
        body: formData
    }).then(response => response.json())
        .then(data => {
            stopLoadingAnimation(loading);
            result.textContent = 'Burnout Probability: ' + data.result;
        }).catch(error => {
            stopLoadingAnimation(loading);
            result.textContent = 'Error: ' + error;
        });
});

// Function to start loading animation
function startLoadingAnimation(loadingElement) {
    const loadingMessages = [
        "Applying Deep Learning Models...",
        "Applying Predictive Algorithms...",
        "Rendering AI Insights..."
    ];
    let messageIndex = 0;

    loadingElement.textContent = loadingMessages[messageIndex];
    loadingElement.style.display = 'block';

    // Update message every 2 seconds
    const intervalId = setInterval(() => {
        messageIndex = (messageIndex + 1) % loadingMessages.length;
        loadingElement.textContent = loadingMessages[messageIndex];
    }, 3000);

    // Store intervalId for stopping later
    loadingElement.dataset.intervalId = intervalId;
}


// Function to stop loading animation
function stopLoadingAnimation(loadingElement) {
    loadingElement.style.display = 'none';
    clearInterval(loadingElement.dataset.intervalId);
}

// ... rest of your code including generateFakeData and createChart functions...


function generateFakeData() {
    const dataPoints = [];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    days.forEach((day, index) => {
        for (let i = 0; i < 3; i++) {
            let fractionalDay = index + (i * 0.33);
            dataPoints.push({
                x: fractionalDay,
                y: Math.floor(Math.random() * 41) // Random burnout percentage between 0 and 40
            });
        }
    });

    return dataPoints;
}

let burnoutChart;

function createChart(dataPoints) {
    const ctx = document.getElementById('burnoutChart').getContext('2d');
    burnoutChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'Burnout Percentage',
                data: dataPoints,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            scales: {
                x: {
                    type: 'linear',
                    ticks: {
                        callback: function (value, index, ticks) {
                            const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                            return days[Math.floor(value)];
                        }
                    },
                    min: 0,
                    max: 6 // Last day index
                },
                y: {
                    beginAtZero: true,
                    max: 100 // Y-axis maximum set to 100
                }
            }
        }
    });
}

function updateChartData() {
    burnoutChart.data.datasets.forEach((dataset) => {
        dataset.data = generateFakeData();
    });
    burnoutChart.update();
}

document.addEventListener('DOMContentLoaded', (event) => {
    const fakeData = generateFakeData();
    createChart(fakeData);
    setInterval(updateChartData, 5000); // Update the chart every 2 seconds
});

function getRandomBurnoutProbability() {
    return Math.floor(Math.random() * 40); // Generates a random number between 0 and 100
}

function updateBurnoutProbability() {
    const resultElement = document.getElementById('result');
    resultElement.textContent = 'Burnout Probability: ' + getRandomBurnoutProbability() + '%';
}

let burnoutUpdateInterval;

document.getElementById('openWebcam').addEventListener('click', function () {
    const video = document.getElementById('webcamVideo');
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
                video.style.display = 'block';

                // Update immediately and then set an interval
                updateBurnoutProbability();
                clearInterval(burnoutUpdateInterval); // Clear any existing interval
                burnoutUpdateInterval = setInterval(updateBurnoutProbability, 3000); // Update every 3 seconds
            })
            .catch(function (error) {
                console.error("Error accessing webcam: ", error);
            });
    } else {
        alert('Your browser does not support accessing the webcam.');
    }
});




document.getElementById('showGraphButton').addEventListener('click', function () {
    const fakeData = generateFakeData();
    createChart(fakeData);
});

document.addEventListener('DOMContentLoaded', () => {
    const binaryBackground = document.getElementById('binaryBackground');

    const createBinaryElement = () => {
        const binary = document.createElement('span');
        binary.textContent = Math.random() < 0.5 ? '0' : '1';
        binary.style.position = 'absolute';
        binary.style.left = `${Math.random() * 100}vw`;
        binary.style.top = `-${20}px`; // Starting above the screen
        binary.style.fontSize = `${Math.random() * 24 + 10}px`;
        binary.style.color = 'green';
        binary.style.opacity = Math.random();
        binary.style.userSelect = 'none';
        binary.style.pointerEvents = 'none';

        binaryBackground.appendChild(binary);

        // Animate falling, slower speed
        let speed = Math.random() * 1 + 1; // Slower speed
        let posY = 0;
        const move = () => {
            posY += speed;
            binary.style.top = `${posY}px`;

            if (posY < window.innerHeight) {
                requestAnimationFrame(move);
            } else {
                binary.remove();
            }
        };
        requestAnimationFrame(move);
    };

    // Create new binary elements more frequently
    setInterval(createBinaryElement, 100); // Increased frequency
});
