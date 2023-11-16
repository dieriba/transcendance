import { Snackbar } from "@mui/material";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
import React from "react";
import { useAppDispatch } from "../../redux/hooks";
import { closeSnackBar } from "../../redux/features/app/app.slice";

interface CustomNotificationBarProps {
  message: string;
  severity: AlertColor;
  open: boolean | undefined;
}

const CustomNotificationBar = ({
  message,
  severity,
  open,
}: CustomNotificationBarProps) => {
  const dispatch = useAppDispatch();
  const Alert = React.forwardRef<HTMLDivElement, AlertProps>(function Alert(
    props,
    ref
  ) {
    return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
  });
  if (open && message.length > 0) {
    return (
      <>
        <Snackbar
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          open={open}
          autoHideDuration={4000}
          onClose={() => dispatch(closeSnackBar())}
          sx={{ maxWidth: "500px" }}
        >
          <Alert sx={{ width: "100%" }} severity={severity}>
            {message}
          </Alert>
        </Snackbar>
      </>
    );
  } else return <></>;
};

export default CustomNotificationBar;
