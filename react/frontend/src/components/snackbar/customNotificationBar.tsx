import { Snackbar } from "@mui/material";
import MuiAlert, { AlertColor, AlertProps } from "@mui/material/Alert";
import React from "react";

interface CustomNotificationBarProps {
  message: string;
  severity?: AlertColor;
  open: boolean | undefined;
  onClose: () => void;
}

const CustomNotificationBar = ({
  message,
  severity = "success",
  open,
  onClose,
}: CustomNotificationBarProps) => {
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
          onClose={onClose}
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
