import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";
import { ThemeContextProvider } from "./theme/ThemeContextProvider.tsx";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore, store } from "./redux/store.ts";
import { Provider } from "react-redux";
import { ErrorBoundary } from "react-error-boundary";
import { StandardError } from "./components/error/StandardError.tsx";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ErrorBoundary
      FallbackComponent={StandardError}
      onError={(error) => console.log(error)}
    >
      <ThemeContextProvider>
        <Provider store={store}>
          <PersistGate persistor={persistStore}>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </PersistGate>
        </Provider>
      </ThemeContextProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
