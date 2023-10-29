import { Middleware } from "redux";

const crashMiddleware: Middleware = () => (next) => (action) => {
  console.log("crashMiddleware");
  try {
    return next(action);
  } catch (error) {
    console.error("Caught an exception!", error);
    throw error;
  }
};

export default crashMiddleware;
