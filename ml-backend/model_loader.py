import os
from tensorflow.keras.models import load_model

MODEL_DIR = "models"

models = {}

def load_models():

    for file in os.listdir(MODEL_DIR):

        if file.endswith(".keras"):

            name = file.replace("_model.keras", "")

            models[name] = load_model(os.path.join(MODEL_DIR, file))

    print("Loaded models:", list(models.keys()))

load_models()


def get_model(exercise):

    return models.get(exercise)