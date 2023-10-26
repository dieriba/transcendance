import { Alert, AlertColor } from "@mui/material";
import React from "react";

interface CustomAlertProps {
  reset: () => void;
  setMsg: (value: React.SetStateAction<string>) => void;
  msg: string;
  severity: AlertColor;
}

const CustomAlert = ({ reset, setMsg, msg, severity }: CustomAlertProps) => {
  return (
    <>
      <Alert
        severity={severity}
        onClose={() => {
          reset();
          setMsg("");
        }}
      >
        {msg}
      </Alert>
    </>
  );
};

export default CustomAlert;
