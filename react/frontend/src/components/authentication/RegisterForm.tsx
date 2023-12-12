import { Controller, SubmitHandler, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, RegisterFormType } from "../../models/RegisterSchema";
import {
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  TextField,
} from "@mui/material";
import { Eye, EyeSlash } from "phosphor-react";
import CustomTextField from "../CustomTextField/CustomTextField";
import { useState } from "react";
import { Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import RHFTextField from "../controlled-components/RHFTextField";
import { useRegisterMutation } from "../../redux/features/user/user.api.slice";
import {
  isErrorWithMessage,
  isFetchBaseQueryError,
} from "../../services/helpers";
import { useAppDispatch } from "../../redux/hooks";
import { showSnackBar } from "../../redux/features/app/app.slice";
const RegisterForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const methods = useForm<RegisterFormType>({
    resolver: zodResolver(RegisterSchema),
  });

  const dispatch = useAppDispatch();
  const [register, { isLoading }] = useRegisterMutation();
  const { control, handleSubmit } = methods;
  const onSubmit: SubmitHandler<RegisterFormType> = async (data) => {
    try {
      const result = await register(data).unwrap();
      dispatch(showSnackBar({ message: result.message }));
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        if (err.data && typeof err.data === "object" && "message" in err.data) {
          dispatch(
            showSnackBar({
              message: err.data.message as string,
              severity: "error",
            })
          );
        } else {
          dispatch(
            showSnackBar({
              message: "An error has occured, please try again later!",
              severity: "error",
            })
          );
        }
      } else if (isErrorWithMessage(err)) {
        dispatch(
          showSnackBar({
            message: err.message,
            severity: "error",
          })
        );
      } else {
        dispatch(
          showSnackBar({
            message: "An error has occured, please try again later!",
            severity: "error",
          })
        );
      }
    }
  };
  const theme = useTheme();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        <RHFTextField name="lastname" label="Lastname" control={control} />
        <RHFTextField name="firstname" label="Firstname" control={control} />
        <RHFTextField name="nickname" label="Nickname" control={control} />
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
          {isLoading ? <CircularProgress size={20} /> : "Register"}
        </Button>
      </Stack>
    </form>
  );
};

export default RegisterForm;
