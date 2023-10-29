import os
import time
import asyncio
import uzair_code
from flask import Flask, render_template, request, jsonify
from concurrent.futures import ThreadPoolExecutor
from hume.models.config import FaceConfig
from hume import HumeStreamClient
import uzair_code

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads/'

# Ensure the upload directory exists
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

executor = ThreadPoolExecutor(max_workers=5)

# Asynchronous analysis function


async def analyze_frame(file_path):
    client = HumeStreamClient(
        "wwO3WtzawTu07HFAWCORQrGWDtRcE4BkcCKCITHTRVYGOgMa")
    config = FaceConfig(identify_faces=True)
    async with client.connect([config]) as socket:
        result = await socket.send_file(file_path)
        return result

# Callback for asynchronous task


# Global variable to store the latest prediction
latest_prediction = None


def frame_analysis_callback(future):
    global latest_prediction
    result = future.result()
    emotions = result["face"]["predictions"][0]["emotions"]
    emotions_vector = [emotion["score"] for emotion in emotions]
    latest_prediction = uzair_code.predict2([emotions_vector])


@app.route('/get-latest-prediction')
def get_latest_prediction():
    if latest_prediction is not None:
        return jsonify({"prediction": latest_prediction})
    else:
        return jsonify({"error": "No prediction available"}), 404


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    if file:
        filename = os.path.join(app.config['UPLOAD_FOLDER'], file.filename)
        file.save(filename)
        time.sleep(9)  # Simulate some processing delay
        result = str(round(uzair_code.predict(filename)*100, 2))
        return jsonify({"result": result})


@app.route('/data-visualization')
def data_visualization():
    return render_template('data_visualization.html')


@app.route('/save-frame', methods=['POST'])
def save_frame():
    if 'frame' not in request.files:
        return jsonify({"error": "No frame received"}), 400

    frame = request.files['frame']
    if frame:
        frame_path = os.path.join(app.config['UPLOAD_FOLDER'], 'temp.jpg')
        frame.save(frame_path)

        # Use executor to run async function
        future = executor.submit(asyncio.run, analyze_frame(frame_path))
        future.add_done_callback(frame_analysis_callback)

        return jsonify({"message": "Frame saved and analysis started"}), 200
    else:
        return jsonify({"error": "Failed to save frame"}), 500


if __name__ == '__main__':
    app.run(debug=True)
