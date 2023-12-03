export const clamp = (val: number, min: number, max: number) =>
  val < min ? min : val > max ? max : val;

export const sign = (val: number) => (val < 0 ? -1 : val > 0 ? 1 : 0);
