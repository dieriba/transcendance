import { Button, Stack } from "@mui/material";
import { useDisable2FaMutation } from "../../../redux/features/user/user.api.slice";
import {
  ValidateOtpSchema,
  ValidateOtpType,
} from "../../../models/login/UserSchema";
import { updatedTwoFa } from "../../../redux/features/user/user.slice";
import { useAppDispatch } from "../../../redux/hooks";
import {
  isFetchBaseQueryError,
  isErrorWithMessage,
} from "../../../services/helpers";
import RHFTextField from "../../controlled-components/RHFTextField";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { showSnackBar } from "../../../redux/features/app/app.slice";

interface Disable2FaProps {
  clearState: () => void;
}

const Disable2Fa = ({ clearState }: Disable2FaProps) => {
  const { control, handleSubmit } = useForm<ValidateOtpType>({
    resolver: zodResolver(ValidateOtpSchema),
  });
  const [disable2Fa, { isLoading }] = useDisable2FaMutation();

  const dispatch = useAppDispatch();
  const onSubmitTwoFa = async (data: ValidateOtpType) => {
    try {
      await disable2Fa(data).unwrap();

      dispatch(updatedTwoFa(false));
      clearState();
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
            DISABLE 2FA
          </Button>
          <Button
            disabled={isLoading}
            fullWidth
            variant="contained"
            color="inherit"
            onClick={() => clearState()}
          >
            BACK TO OPTIONS
          </Button>
        </Stack>
      </form>
    </>
  );
};

export default Disable2Fa;
