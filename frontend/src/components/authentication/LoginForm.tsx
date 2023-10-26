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
import { useLoginMutation } from "../../redux/features/auth/auth.api.slice";
import {
  isFetchBaseQueryError,
  isErrorWithMessage,
} from "../../services/helpers";
import { useAppDispatch } from "../../redux/hooks";
import { authenticateUser } from "../../redux/features/auth/auth.slice";
import { ResponseLoginSchema } from "../../models/login/ResponseLogin";
import { useNavigate } from "react-router-dom";
import { PATH_APP } from "../../routes/paths";
import CustomAlert from "../Alert/CustomAlert";

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const methods = useForm<LoginFormType>({
    resolver: zodResolver(LoginSchema),
  });

  const { handleSubmit, control } = methods;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading, error, reset }] = useLoginMutation();
  const [errMsg, setErrMsg] = useState("");

  const onSubmit = async (data: LoginFormType) => {
    try {
      const result = await login(data).unwrap();

      const parse = await ResponseLoginSchema.safeParseAsync(result.data);
      if (!parse.success) {
        setErrMsg("An error has occured, please try again later!");
      } else {
        const data = parse.data;
        dispatch(authenticateUser(data));
        methods.reset();
        navigate(PATH_APP.dashboard.games);
      }
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        if (err.data && typeof err.data === "object" && "message" in err.data) {
          setErrMsg(err.data.message as string);
        } else {
          setErrMsg("An error has occured, please try again later!");
        }
      } else if (isErrorWithMessage(err)) {
        setErrMsg(err.message);

        console.log(err);
      }
    }
  };
  const theme = useTheme();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {(error || errMsg.length > 0) && (
          <>
            <CustomAlert
              severity="error"
              reset={reset}
              setMsg={setErrMsg}
              msg={errMsg}
            />
          </>
        )}
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
  );
};
export default LoginForm;
