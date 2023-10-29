import openai
import numpy as np
import re
from colorama import Fore, Style

import os
import psycopg2

openai.api_key = "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"

SYSTEM_INSTRUCTIONS_COMEDIAN = """You are now playing the role of an AI assistant designed to support medical personnel, including doctors, nurses, and other healthcare workers. Your responses should be empathetic, informative, and encouraging, aimed at providing support and guidance, especially to those who might be nearing burnout. Your tone should be gentle and understanding, similar to a well-trained counselor or mentor in the healthcare field. Your primary goal is to offer support, resources, and understanding to help alleviate stress and burnout symptoms.

In your first response, you will:

Introduce yourself as an AI assistant.
Describe the purpose of this experience.
Ask the user about their current state or feelings, and if there's anything specific they need support with.
Throughout the conversation:

You will provide empathetic responses and offer practical advice or resources related to managing stress and burnout in the healthcare industry.
Ask open-ended questions to understand the user's situation better, such as their specific challenges, feelings, and needs.
Offer suggestions on stress management techniques, resources for professional support, and self-care tips tailored to healthcare professionals.
If the user seems disengaged or overwhelmed, gently probe with more specific questions about their work environment, recent experiences, or personal coping mechanisms.
Your responses will be concise yet informative, consisting of 2-4 sentences, with the last sentence always being a question to encourage further dialogue. The interaction should be user-centered, focusing on their needs and emotions. Remember, you are there to offer support and guidance, not to provide medical or psychological treatment.

Remember, in your first response, you will (i) introduce yourself, (ii) describe the purpose of this experience, and (iii) ask about the user’s current state or specific needs for support."""

EMOTIONS = np.array([
    "admiring", "adoring", "appreciative", "amused", "angry", "anxious", "awestruck", "uncomfortable", "bored", "calm",
    "focused", "contemplative", "confused", "contemptuous", "content", "hungry", "determined", "disappointed",
    "disgusted", "distressed", "doubtful", "euphoric", "embarrassed", "disturbed", "entranced", "envious", "excited",
    "fearful", "guilty", "horrified", "interested", "happy", "enamored", "nostalgic", "pained", "proud", "inspired",
    "relieved", "smitten", "sad", "satisfied", "desirous", "ashamed", "negatively surprised", "positively surprised",
    "sympathetic", "tired", "triumphant"
])

conversation = [{
    "role": "system",
    "content": SYSTEM_INSTRUCTIONS_COMEDIAN
}, {
    'role':
    'user',
    'content':
    "The user walks into your comedy club. As a comedian named Joaquin, what is the first thing you say to them?"
}]

emotion_history = []


def create_message(user_message=None, user_emotion=None):

    return f"The user says, '{user_message}'. Initially the user looked {user_emotion[0]}, then {user_emotion[1]}."


def find_max_emotion(predictions):

    def get_adjective(score):
        if 0.26 <= score < 0.35:
            return "slightly"
        elif 0.35 <= score < 0.44:
            return "somewhat"
        elif 0.44 <= score < 0.53:
            return "moderately"
        elif 0.53 <= score < 0.62:
            return "quite"
        elif 0.62 <= score < 0.71:
            return "very"
        elif 0.71 <= score <= 3:
            return "extremely"
        else:
            return ""

    if len(predictions) == 0:
        return ["calm", "bored"]

    def process_section(section):
        emotion_predictions = []
        for frame_dict in section:
            if 'predictions' not in frame_dict['face']:
                continue
            frame_emo_dict = frame_dict['face']["predictions"][0]["emotions"]
            emo_dict = {x["name"]: x["score"] for x in frame_emo_dict}
            emo_frame = sorted(emo_dict.items())
            emo_frame = np.array([x[1] for x in emo_frame])
            emotion_predictions.append(emo_frame)
        if len(emotion_predictions) == 0:
            return 'calm'
        # Assuming 'emotion_predictions' is a 2D array
        mean_predictions = np.array(emotion_predictions).mean(axis=0)
        # Get the index of the highest value
        top_index = np.argmax(mean_predictions)

        # Add adjectives to the top emotion based on the prediction score
        top_emotion_adjective = f"{get_adjective(mean_predictions[top_index])} {EMOTIONS[top_index]}"
        return top_emotion_adjective

    # Split predictions into 2 sections
    section_size = len(predictions) // 2
    sections = [
        predictions[i * section_size:(i + 1) * section_size] for i in range(2)]

    # Get top emotion for each section
    top_emotions = [process_section(section) for section in sections]
    return top_emotions


def store_emotions(result, rec_id):

    print("b")

    emotion_history.append(result)


def estimate_burnout(predictions):
    print("f")
    emotion_predictions = []
    for frame_dict in predictions:

        print("g")
        if 'predictions' not in frame_dict['face']:
            continue
        frame_emo_dict = frame_dict['face']["predictions"][0]["emotions"]
        emo_dict = {x["name"]: x["score"] for x in frame_emo_dict}
        emo_frame = sorted(emo_dict.items())
        emo_frame = np.array([x[1] for x in emo_frame])
        emotion_predictions.append(emo_frame)
    if len(emotion_predictions) == 0:
        return 'calm'

    print(emotion_predictions)


def message(transcription):
    global emotion_history
    user_emotions = find_max_emotion(emotion_history)
    message = create_message(transcription, user_emotions)
    print(Fore.GREEN + "PROMPT:", message + Style.RESET_ALL)
    conversation.append({"role": "user", "content": message})
    completion = openai.ChatCompletion.create(
        model="gpt-3.5-turbo", messages=conversation)
    response = completion.choices[0]['message']['content']
    conversation.append({"role": "assistant", "content": response})
    response = re.sub(r'\([^)]*\)', '', response)
    response = re.sub(r'\[.*?\]', '', response)
    response = re.sub(r'^"|"$', '', response)
    print(Fore.CYAN + "JOAQUIN:", response + Style.RESET_ALL)
    emotion_history = []

    print("e")
    estimate_burnout(emotion_history)

    conn = psycopg2.connect(os.environ["DATABASE_URL"])

    with conn.cursor() as cur:
        cur.execute("INSERT INTO \"RecordingChunks\" (prediction) VALUES (%s)",
                    (0.1,))
        conn.commit()

    return response
