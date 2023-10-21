import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeContextProvider } from "./theme/ThemeContextProvider.tsx";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore, store } from "./redux/store.ts";
import { Provider } from "react-redux";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <Provider store={store}>
        <PersistGate persistor={persistStore}>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </PersistGate>
      </Provider>
    </ThemeContextProvider>
  </React.StrictMode>
);
