import { useForm } from "react-hook-form";
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

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const methods = useForm<LoginFormType>({
    resolver: zodResolver(LoginSchema),
  });

  const { errors, isSubmitting, isSubmitSuccessful } = methods.formState;
  const onSubmit = async (data: LoginFormType) => {
    console.log(data);
  };
  const theme = useTheme();

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <CustomTextField error={errors.email} message={errors.email?.message}>
          <TextField
            {...methods.register("email")}
            label="Email"
            fullWidth
            error={!!errors.email}
          />
        </CustomTextField>
        <CustomTextField
          error={errors.password}
          message={errors.password?.message}
        >
          <TextField
            {...methods.register("password")}
            label="Password"
            fullWidth
            error={!!errors.password}
            type={showPassword ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword((prev) => !prev)}>
                    {showPassword ? <Eye /> : <EyeSlash />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </CustomTextField>
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
