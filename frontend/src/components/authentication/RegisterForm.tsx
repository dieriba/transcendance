import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, RegisterFormType } from "../../models/RegisterSchema";
import { Button, IconButton, InputAdornment, TextField } from "@mui/material";
import { Eye, EyeSlash } from "phosphor-react";
import CustomTextField from "../CustomTextField/CustomTextField";
import { useState } from "react";
import { Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import RHFTextField from "../controlled-components/RHFTextField";
import { useAppDispatch } from "../../redux/hooks";

const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const methods = useForm<RegisterFormType>({
    resolver: zodResolver(RegisterSchema),
  });

  const { control, handleSubmit } = methods;

  const onSubmit: SubmitHandler<RegisterFormType> = (data) => {
    try {
    } catch (error) {}
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
        <Controller
          name="confirmPassword"
          control={control}
          render={({ field: { value, onChange }, fieldState: { error } }) => (
            <CustomTextField error={error} message={error?.message}>
              <TextField
                label="confirmPassword"
                fullWidth
                onChange={onChange}
                value={value || ""}
                error={!!error}
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
          Register
        </Button>
      </Stack>
    </form>
  );
};

export default RegisterForm;
