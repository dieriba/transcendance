import { Middleware } from "redux";

const crashMiddleware: Middleware = () => (next) => (action) => {
  try {
    return next(action);
  } catch (error) {
    console.error("Caught an exception!", error);
    throw error;
  }
};

export default crashMiddleware;
