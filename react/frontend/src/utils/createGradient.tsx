const createGradient = (color1: string, color2: string) => {
  return `linear-gradient(to bottom, ${color1}, ${color2})`;
};

export default createGradient;
