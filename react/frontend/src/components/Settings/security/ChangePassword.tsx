import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  AlertColor,
  Button,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { Eye, EyeSlash } from "phosphor-react";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  ChangePasswordType,
  ChangePasswordSchema,
} from "../../../models/login/UserSchema";
import { useChangePasswordMutation } from "../../../redux/features/user/user.api.slice";
import CustomTextField from "../../CustomTextField/CustomTextField";
import {
  isFetchBaseQueryError,
  isErrorWithMessage,
} from "../../../services/helpers";

const ChangePassword = () => {
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [openSnack, setOpenSnack] = useState(false);
  const theme = useTheme();
  const { control, handleSubmit } = useForm<ChangePasswordType>({
    resolver: zodResolver(ChangePasswordSchema),
  });
  const [showPassword, setShowPassword] = useState<{
    current: boolean;
    password: boolean;
    confirmPassword: boolean;
  }>({ current: false, confirmPassword: false, password: false });

  const handleCloseSnack = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };

  const [changePassword, { isLoading }] = useChangePasswordMutation();

  const onSubmit = async (data: ChangePasswordType) => {
    try {
      const res = await changePassword(data).unwrap();

      setSeverity("success");
      setMessage(res.message);
      setOpenSnack(true);
    } catch (error) {
      if (isFetchBaseQueryError(error)) {
        if (
          error.data &&
          typeof error.data === "object" &&
          ("message" in error.data || "error" in error.data)
        ) {
          if ("message" in error.data) {
            setMessage(error.data.message as string);
          } else {
            setMessage(error.data.error as string);
          }
        } else {
          setMessage("An error has occured, please try again later!");
        }
      } else if (isErrorWithMessage(error)) {
        console.log("cx");
        setMessage(error.message);
      }
      setOpenSnack(true);
      setSeverity("error");
    }
  };

  return (
    <>
      <Stack spacing={2} p={2}>
        {openSnack && (
          <Alert
            onClose={handleCloseSnack}
            severity={severity}
            sx={{ width: "100%" }}
          >
            {message}
          </Alert>
        )}
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            <Controller
              name="currentPassword"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <CustomTextField error={error} message={error?.message}>
                  <TextField
                    label="currentPassword"
                    fullWidth
                    value={value || ""}
                    onChange={onChange}
                    error={!!error}
                    type={showPassword.current ? "text" : "password"}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowPassword((prev) => ({
                                ...prev,
                                current: !prev.current,
                              }))
                            }
                          >
                            {showPassword.current ? <Eye /> : <EyeSlash />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </CustomTextField>
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <CustomTextField error={error} message={error?.message}>
                  <TextField
                    label="password"
                    fullWidth
                    value={value || ""}
                    onChange={onChange}
                    error={!!error}
                    type={showPassword.password ? "text" : "password"}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowPassword((prev) => ({
                                ...prev,
                                password: !prev.password,
                              }))
                            }
                          >
                            {showPassword.password ? <Eye /> : <EyeSlash />}
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
              render={({
                field: { value, onChange },
                fieldState: { error },
              }) => (
                <CustomTextField error={error} message={error?.message}>
                  <TextField
                    label="password"
                    fullWidth
                    value={value || ""}
                    onChange={onChange}
                    error={!!error}
                    type={showPassword.confirmPassword ? "text" : "password"}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() =>
                              setShowPassword((prev) => ({
                                ...prev,
                                confirmPassword: !prev.confirmPassword,
                              }))
                            }
                          >
                            {showPassword.confirmPassword ? (
                              <Eye />
                            ) : (
                              <EyeSlash />
                            )}
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
              disabled={isLoading}
            >
              Change Password
            </Button>
          </Stack>
        </form>
      </Stack>
    </>
  );
};

export default ChangePassword;
