import { Stack, Typography } from "@mui/material";
import { ReactNode } from "react";
import { FieldError, Merge } from "react-hook-form";

interface CustomTextFieldProps {
  children: ReactNode;
  message: string | undefined;
  error: FieldError | undefined | Merge<FieldError, (FieldError | undefined)[]> | undefined;
}

const CustomTextField = ({
  children,
  message,
  error,
}: CustomTextFieldProps) => {
  return (
    <Stack spacing={1}>
      {children}
      {error && (
        <Typography variant="caption" color="red">
          {message}
        </Typography>
      )}
    </Stack>
  );
};

export default CustomTextField;
