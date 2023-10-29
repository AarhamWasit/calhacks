from flask import Flask, render_template, request, jsonify
import os
import time  # Used for simulating processing delay
import uzair_code


app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'static/uploads/'


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

        # Simulate some processing delay
        time.sleep(9)

        result = str(round(uzair_code.predict(filename)*100, 2))

        # For now, we just return a default value
        return jsonify({"result": result})


@app.route('/data-visualization')
def data_visualization():
    return render_template('data_visualization.html')


if __name__ == '__main__':
    app.run(debug=True)
