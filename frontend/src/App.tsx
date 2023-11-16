import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { useThemeContext } from "./theme/ThemeContextProvider";
import Router from "./routes";
import { useAppSelector } from "./redux/hooks";
import { RootState } from "./redux/store";
import CustomNotificationBar from "./components/snackbar/customNotificationBar";

const App = () => {
  const { theme } = useThemeContext();
  const { open, severity, message } = useAppSelector(
    (state: RootState) => state.app
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router />
      <CustomNotificationBar
        open={open}
        severity={severity}
        message={message}
      />
    </ThemeProvider>
  );
};

export default App;
