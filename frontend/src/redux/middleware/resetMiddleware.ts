import { Middleware } from "@reduxjs/toolkit";

export const resetDataMiddleware    : Middleware =
  (initialAppState) => (next) => (action) => {
    if (action.type === "resetData") {
      const actionWithInitialAppState = {
        ...action,
        payload: initialAppState,
      };
      return next(actionWithInitialAppState);
    }

    return next(action);
  };
