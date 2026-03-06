from inference import predict_form
from analyze_pose import analyze_pose
from llm_feedback import generate_feedback


class RehabAIEngine:

    def process_frame(self, landmarks, exercise):

        # LSTM prediction
        form, confidence = predict_form(landmarks, exercise)

        # rule based
        rule = analyze_pose(landmarks, exercise)

        feedback = rule["feedback"]

        # LLM feedback
        coaching = generate_feedback(feedback)

        accuracy = int(confidence * 100)

        return {

            "exercise": exercise,
            "accuracy": accuracy,
            "feedback": [coaching],
            "angles": rule["angles"],
            "repCount": rule["repCount"],
            "isCorrectForm": form == "correct",
            "confidence": confidence
        }