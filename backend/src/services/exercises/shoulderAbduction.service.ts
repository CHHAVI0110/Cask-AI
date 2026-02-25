import { computeAngle, Keypoint } from '../../utils/angle';

type State = 'up' | 'down';
type Side = 'left' | 'right';

interface Result {
  angle?: number;
  state: State;
  repCompleted: boolean;
  correct: boolean;
  feedback: string;
}

export const checkShoulderAbduction = (
  kp: Keypoint[],
  prevState: State,
  side: Side = 'left'
): Result => {

  const indexMap: Record<Side, [number, number, number]> = {
    left: [11, 13, 15],
    right: [12, 14, 16]
  };

  if (!indexMap[side]) {
    return {
      state: prevState,
      feedback: 'Invalid side',
      correct: false,
      repCompleted: false
    };
  }

  const [s, e, w] = indexMap[side];

  // Landmark safety check
  if (!kp[s] || !kp[e] || !kp[w]) {
    return {
      state: prevState,
      feedback: 'Landmarks not detected',
      correct: false,
      repCompleted: false
    };
  }

  const armAngle = computeAngle(kp[s], kp[e], kp[w]);

  let state: State = prevState;
  let repCompleted = false;
  let correct = true;
  let feedback = '';

  // -------------------------
  // STATE TRANSITION
  // -------------------------
  if (armAngle < 35) {
    state = 'down';
  } 
  else if (armAngle > 80 && prevState === 'down') {
    state = 'up';
    repCompleted = true;
  }

  // -------------------------
  // FEEDBACK LOGIC
  // -------------------------
  if (armAngle < 25) {
    feedback = 'Relax your arm by your side.';
    correct = false;
  } 
  else if (armAngle < 60) {
    feedback = 'Lift your arm further to the side.';
    correct = false;
  } 
  else if (armAngle < 80) {
    feedback = 'Almost there, raise a little more.';
    correct = false;
  } 
  else {
    feedback = 'Great lift!';
  }

  return {
    angle: armAngle,
    state,
    repCompleted,
    correct,
    feedback
  };
};
