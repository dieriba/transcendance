import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { ResponseLoginSchema } from "../../../models/login/ResponseLogin";
import {
  ValidateOtpType,
  ValidateOtpSchema,
} from "../../../models/login/UserSchema";
import {
  isFetchBaseQueryError,
  isErrorWithMessage,
} from "../../../services/helpers";
import {
  useDisconnectAllExceptMeMutation,
  useValidateOtpMutation,
} from "../../../redux/features/user/user.api.slice";
import { setMyId } from "../../../redux/features/groups/group.slice";
import {
  authenticateUser,
  setTwoFaId,
} from "../../../redux/features/user/user.slice";
import { PATH_APP } from "../../../routes/paths";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import { useNavigate } from "react-router-dom";
import { RootState } from "../../../redux/store";
import RHFTextField from "../../../components/controlled-components/RHFTextField";
import { showSnackBar } from "../../../redux/features/app/app.slice";

const TwoFaPage = () => {
  const { reset, handleSubmit, control } = useForm<ValidateOtpType>({
    resolver: zodResolver(ValidateOtpSchema),
  });
  const navigate = useNavigate();

  const [validate2Fa, { isLoading }] = useValidateOtpMutation();

  const handleNavigate = () => {
    dispatch(setTwoFaId(undefined));
    navigate(PATH_APP.auth.login);
  };
  const [disconnectAllInstanceExceptMe] = useDisconnectAllExceptMeMutation();
  const dispatch = useAppDispatch();
  const id = useAppSelector((state: RootState) => state.user.twoFa) as string;
  const onSubmitTwoFa = async (data: ValidateOtpType) => {
    try {
      const result = await validate2Fa({ id, token: data.token }).unwrap();

      const parse = await ResponseLoginSchema.safeParseAsync(result.data);

      if (!parse.success) {
        dispatch(
          showSnackBar({
            message: "An error has occured, please try again later!",
            severity: "error",
          })
        );
      } else {
        reset();
        const data = parse.data;
        dispatch(setTwoFaId(undefined));
        dispatch(authenticateUser(data));
        dispatch(setMyId(data.user.id));
        await disconnectAllInstanceExceptMe().unwrap();
        navigate(PATH_APP.dashboard.profile, { replace: true });
      }
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        if (
          err.data &&
          typeof err.data === "object" &&
          ("message" in err.data || "error" in err.data)
        ) {
          if ("message" in err.data) {
            dispatch(
              showSnackBar({
                message: err.data.message as string,
                severity: "error",
              })
            );
            return;
          }
          dispatch(
            showSnackBar({
              message: err.data.error as string,
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
        dispatch(showSnackBar({ message: err.message, severity: "error" }));
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmitTwoFa)}>
        <Stack spacing={2}>
          <RHFTextField name="token" label="token" control={control} />
          <Button
            disabled={isLoading}
            fullWidth
            variant="contained"
            color="inherit"
            type="submit"
          >
            Verify 2FA
          </Button>
          <Button
            disabled={isLoading}
            fullWidth
            onClick={() => {
              handleNavigate();
            }}
            variant="contained"
            color="inherit"
          >
            Back To Login
          </Button>
        </Stack>
      </form>
    </>
  );
};

export default TwoFaPage;
