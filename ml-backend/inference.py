import numpy as np
from model_loader import get_model

SEQUENCE_LENGTH = 30

sequence_buffer = {}


def predict_form(landmarks, exercise):

    if exercise not in sequence_buffer:
        sequence_buffer[exercise] = []

    seq = sequence_buffer[exercise]

    seq.append(landmarks)

    if len(seq) < SEQUENCE_LENGTH:
        return "waiting", 0.0

    if len(seq) > SEQUENCE_LENGTH:
        seq.pop(0)

    X = np.array(seq)
    X = np.expand_dims(X, axis=0)

    model = get_model(exercise)

    if model is None:
        return None, 0.0

    pred = model.predict(X)[0][0]

    form = "correct" if pred > 0.5 else "incorrect"

    return form, float(pred)