document.getElementById('uploadForm').addEventListener('submit', function (e) {
    e.preventDefault();  // Prevent the default form submission

    var formData = new FormData(this);
    fetch('/upload', {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.result) {
                // If the server returns a result immediately
                document.getElementById('result').innerHTML = 'Result: ' + data.result + '%';
            } else {
                // If the result is not ready yet, start polling
                pollForResults();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('result').innerHTML = 'Error in processing.';
        });

    document.getElementById('loading').style.display = 'block'; // Show loading indicator
});

function pollForResults() {
    var intervalId = setInterval(() => {
        fetch('/get-results') // Updated endpoint without the key
            .then(response => response.json())
            .then(data => {
                if (data.result) {
                    clearInterval(intervalId); // Stop polling when result is received
                    document.getElementById('result').innerHTML = 'Result: ' + data.result + '%';
                    document.getElementById('loading').style.display = 'none'; // Hide loading indicator
                }
            })
            .catch(error => {
                console.error('Error:', error);
                clearInterval(intervalId); // Stop polling in case of error
                document.getElementById('result').innerHTML = 'Error in retrieving results.';
                document.getElementById('loading').style.display = 'none'; // Hide loading indicator
            });
    }, 5000); // Poll every 5 seconds
}



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
    fetch('/get-latest-prediction')
        .then(response => response.json())
        .then(data => {
            if (data.prediction !== undefined) {
                // Multiply by 100 and round to 2 decimal places
                const predictionPercentage = (data.prediction * 100).toFixed(2);
                document.getElementById('result').textContent = 'Burnout Probability: ' + predictionPercentage + '%';
            } else {
                document.getElementById('result').textContent = 'Waiting for prediction...';
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('result').textContent = 'Waiting for prediction....';
        });
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

                // Start saving frames
                startSavingFrames(video);
            })
            .catch(function (error) {
                console.error("Error accessing webcam: ", error);
            });
    } else {
        alert('Your browser does not support accessing the webcam.');
    }
});

function startSavingFrames(videoElement) {
    setInterval(() => {
        captureAndSendFrame(videoElement);
    }, 3000); // Capture frame every 3 seconds
}

function captureAndSendFrame(videoElement) {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

    // Convert canvas to dataURL or blob
    canvas.toBlob(blob => {
        const formData = new FormData();
        formData.append('frame', blob, 'temp.jpg');

        fetch('/save-frame', {
            method: 'POST',
            body: formData
        }).then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok.');
            }
        }).catch(error => {
            console.error('Error saving frame:', error);
        });
    }, 'image/jpeg');
}



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
