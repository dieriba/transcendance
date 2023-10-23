import { SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, RegisterFormType } from "../../models/RegisterSchema";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import { Eye, EyeSlash } from "phosphor-react";
import CustomTextField from "../CustomTextField/CustomTextField";
import { useState } from "react";
import { Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormType>({
    resolver: zodResolver(RegisterSchema),
  });
  const onSubmit: SubmitHandler<RegisterFormType> = (data) => {
    console.log(data);
  };
  const theme = useTheme();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <CustomTextField error={errors.email} message={errors.email?.message}>
          <TextField
            {...register("email")}
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
            {...register("password")}
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
        <CustomTextField
          error={errors.confirmPassword}
          message={errors.confirmPassword?.message}
        >
          <TextField
            {...register("confirmPassword")}
            label="confirmPassword"
            fullWidth
            error={!!errors.confirmPassword}
            type={showConfirmPassword ? "text" : "password"}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                  >
                    {showConfirmPassword ? <Eye /> : <EyeSlash />}
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
          Register
        </Button>
      </Stack>
    </form>
  );
};

export default RegisterForm;
