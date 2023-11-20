import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { useThemeContext } from "./theme/ThemeContextProvider";
import Router from "./routes";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { RootState } from "./redux/store";
import CustomNotificationBar from "./components/snackbar/customNotificationBar";
import { closeSnackBar } from "./redux/features/app/app.slice";

const App = () => {
  const { theme } = useThemeContext();
  const { open, severity, message } = useAppSelector(
    (state: RootState) => state.app
  );

  const dispatch = useAppDispatch();

  const onClose = () => {
    dispatch(closeSnackBar());
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router />
      <CustomNotificationBar
        open={open}
        severity={severity}
        message={message}
        onClose={onClose}
      />
    </ThemeProvider>
  );
};

export default App;
