export interface Keypoint {
  x: number;
  y: number;
  z?: number;
}

export const computeAngle = (
  a: Keypoint,
  b: Keypoint,
  c: Keypoint
): number => {
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };

  const dot = ba.x * bc.x + ba.y * bc.y;
  const magBA = Math.sqrt(ba.x ** 2 + ba.y ** 2);
  const magBC = Math.sqrt(bc.x ** 2 + bc.y ** 2);

  const cosine = dot / (magBA * magBC + 1e-6);
  const angle = Math.acos(Math.min(Math.max(cosine, -1), 1));

  return (angle * 180) / Math.PI;
};
