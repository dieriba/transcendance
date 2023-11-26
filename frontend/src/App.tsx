import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import { useThemeContext } from "./theme/ThemeContextProvider";
import Router from "./routes";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import { RootState } from "./redux/store";
import CustomNotificationBar from "./components/snackbar/customNotificationBar";
import {
  closeGameInvitation,
  closeSnackBar,
} from "./redux/features/app/app.slice";
import ReceivedGameInvitation from "./components/Chat/Group/View/ReceivedGameInvitation";

const App = () => {
  const { theme } = useThemeContext();
  const { open, severity, message, openGameInvitation, senderId } =
    useAppSelector((state: RootState) => state.app);

  const dispatch = useAppDispatch();

  const onClose = () => {
    dispatch(closeSnackBar());
  };

  const onCloseGameInvitation = () => {
    dispatch(closeGameInvitation());
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
      <ReceivedGameInvitation
        open={openGameInvitation}
        onClose={onCloseGameInvitation}
        message={message}
        id={senderId}
      />
    </ThemeProvider>
  );
};

export default App;
