import numpy as np

rep_count = 0
stage = None


def calculate_angle(a, b, c):

    a = np.array(a)
    b = np.array(b)
    c = np.array(c)

    radians = np.arctan2(c[1]-b[1], c[0]-b[0]) - np.arctan2(a[1]-b[1], a[0]-b[0])
    angle = np.abs(radians*180.0/np.pi)

    if angle > 180:
        angle = 360-angle

    return angle


def analyze_pose(landmarks, exercise):

    global rep_count, stage

    # example squat joints
    hip = [landmarks[23]['x'], landmarks[23]['y']]
    knee = [landmarks[25]['x'], landmarks[25]['y']]
    ankle = [landmarks[27]['x'], landmarks[27]['y']]

    knee_angle = calculate_angle(hip, knee, ankle)

    feedback = []

    if knee_angle < 70:
        feedback.append("Go lower in squat")

    if knee_angle > 160:
        stage = "up"

    if knee_angle < 90 and stage == "up":
        stage = "down"
        rep_count += 1

    angles = {
        "knee": knee_angle
    }

    return {
        "repCount": rep_count,
        "angles": angles,
        "feedback": feedback
    }