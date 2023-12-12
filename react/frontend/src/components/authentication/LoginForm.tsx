import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginFormType } from "../../models/login/LoginSchema";
import {
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Button,
  CircularProgress,
} from "@mui/material";

import { useTheme } from "@mui/material";

import { useState } from "react";
import { Eye, EyeSlash } from "phosphor-react";
import CustomTextField from "../CustomTextField/CustomTextField";
import RHFTextField from "../controlled-components/RHFTextField";
import {
  useDisconnectAllExceptMeMutation,
  useLoginMutation,
} from "../../redux/features/user/user.api.slice";
import {
  isFetchBaseQueryError,
  isErrorWithMessage,
} from "../../services/helpers";
import { useAppDispatch } from "../../redux/hooks";
import {
  authenticateUser,
  setTwoFaId,
} from "../../redux/features/user/user.slice";
import {
  ResponseLoginSchema,
  ResponseTwoFaLoginSchema,
  ResponseTwoFaLoginType,
} from "../../models/login/ResponseLogin";
import { useNavigate } from "react-router-dom";
import { PATH_APP } from "../../routes/paths";
import { setMyId } from "../../redux/features/groups/group.slice";
import { showSnackBar } from "../../redux/features/app/app.slice";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const methods = useForm<LoginFormType>({
    resolver: zodResolver(LoginSchema),
  });

  const { handleSubmit, control } = methods;
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [disconnectAllInstanceExceptMe] = useDisconnectAllExceptMeMutation();

  const onSubmit = async (data: LoginFormType) => {
    try {
      const result = await login(data).unwrap();

      const twoFaParse = await ResponseTwoFaLoginSchema.safeParseAsync(
        result.data
      );
      const parse = await ResponseLoginSchema.safeParseAsync(result.data);

      if (twoFaParse.success) {
        dispatch(setTwoFaId((result.data as ResponseTwoFaLoginType).id));
        navigate(PATH_APP.auth.twoFa);
        return;
      }

      if (!parse.success) {
        dispatch(
          showSnackBar({
            message: "An error has occured, please try again later!",
            severity: "error",
          })
        );
      } else {
        const data = parse.data;
        dispatch(authenticateUser(data));
        dispatch(setMyId(data.user.id));
        methods.reset();
        await disconnectAllInstanceExceptMe().unwrap();
        navigate(PATH_APP.dashboard.profile);
      }
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
    <>
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
            {isLoading ? <CircularProgress size={20} /> : "Login"}
          </Button>
        </Stack>
      </form>
    </>
  );
};
export default LoginForm;
