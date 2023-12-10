export const clamp = (val: number, min: number, max: number) =>
  val < min ? min : val > max ? max : val;

export const sign = (val: number) => (val < 0 ? -1 : val > 0 ? 1 : 0);

export const getRandomNumber = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min)) + min;
