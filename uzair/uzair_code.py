from sklearn.linear_model import LogisticRegression
import os
from dotenv import load_dotenv
from hume import HumeBatchClient
from hume.models.config import FaceConfig
import pandas as pd
import pickle

load_dotenv()


def get_emotion_vector(file_path):
    client = HumeBatchClient(os.environ["HUME_API_KEY"], timeout=600)

    print(file_path)

    configs = [FaceConfig()]
    job = client.submit_job(None, configs, files=[file_path])

    job.await_complete(timeout=600)
    results = job.get_predictions()

    emotions = results[0]["results"]["predictions"][0]["models"]["face"]["grouped_predictions"][0]["predictions"][0]["emotions"]

    emotions_vector = [emotion["score"] for emotion in emotions]

    print(pd.DataFrame(emotions).sort_values(
        by="score", ascending=False).head(5)["name"])

    return emotions_vector


def train_model(file_paths, labels):
    # train a model to predict label from jpegs files

    vectors = [get_emotion_vector(file_path) for file_path in file_paths]

    model = LogisticRegression()
    model.fit(vectors, labels)

    with open('model.pkl', 'wb') as f:
        pickle.dump(model, f)


def predict(file_path):
    # load
    with open('model.pkl', 'rb') as f:
        model = pickle.load(f)

        print("breaker")

        return model.predict_proba([get_emotion_vector(file_path)])[0][1]


if __name__ == "__main__":
    file_paths = [
        f"faces/{i}.jpg" for i in ["103", "101", "104", "150"]
    ]
    labels = [0, 0, 1, 1]
    train_model(file_paths, labels)
    print(predict("faces/0.png"))
