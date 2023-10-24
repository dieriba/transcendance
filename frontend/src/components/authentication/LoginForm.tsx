import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginFormType } from "../../models/LoginSchema";
import {
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Button,
} from "@mui/material";

import { useTheme } from "@mui/material";

import { useState } from "react";
import { Eye, EyeSlash } from "phosphor-react";
import CustomTextField from "../CustomTextField/CustomTextField";
import RHFTextField from "../controlled-components/RHFTextField";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    control,
    handleSubmit,
    formState: { isSubmitSuccessful, isSubmitting },
  } = useForm<LoginFormType>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginFormType) => {
    console.log(data);
  };
  const theme = useTheme();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="email" label="Email" control={control} />

        <Controller
          name="password"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <CustomTextField error={error} message={error?.message}>
              <TextField
                label="Password"
                fullWidth
                onChange={onChange}
                value={value || ""}
                error={!!error}
                type={showPassword ? "text" : "password"}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword((prev) => !prev)}
                      >
                        {showPassword ? <Eye /> : <EyeSlash />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </CustomTextField>
          )}
        />

        <Button
          color="inherit"
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          sx={{
            ":hover": {
              backgroundColor: theme.palette.primary.main,
              borderRadius: 1.5,
              color: "white",
            },
          }}
          disableElevation={true}
        >
          Login
        </Button>
      </Stack>
    </form>
  );
};

export default LoginForm;
