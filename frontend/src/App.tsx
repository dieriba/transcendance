import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { useThemeContext } from "./theme/ThemeContextProvider";
import Router from "./routes";

const App = () => {
  const { theme } = useThemeContext();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router />
    </ThemeProvider>
  );
};

export default App;
