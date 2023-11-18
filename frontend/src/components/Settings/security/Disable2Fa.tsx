import { Alert, AlertColor, Button, Stack } from "@mui/material";
import { useState } from "react";
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

interface Disable2FaProps {
  clearState: () => void;
}

const Disable2Fa = ({ clearState }: Disable2FaProps) => {
  const { control, handleSubmit } = useForm<ValidateOtpType>({
    resolver: zodResolver(ValidateOtpSchema),
  });
  const [disable2Fa, { isLoading }] = useDisable2FaMutation();

  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [openSnack, setOpenSnack] = useState(false);

  const handleCloseSnack = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };

  const dispatch = useAppDispatch();
  const onSubmitTwoFa = async (data: ValidateOtpType) => {
    try {
      await disable2Fa(data).unwrap();

      dispatch(updatedTwoFa(false));
      clearState();
    } catch (err) {
      setSeverity("error");
      setOpenSnack(true);
      if (isFetchBaseQueryError(err)) {
        if (
          err.data &&
          typeof err.data === "object" &&
          ("message" in err.data || "error" in err.data)
        ) {
          if ("message" in err.data) {
            setMessage(err.data.message as string);
            return;
          }
          setMessage(err.data.error as string);
        } else {
          setMessage("An error has occured, please try again later!");
        }
      } else if (isErrorWithMessage(err)) {
        setMessage(err.message);
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmitTwoFa)}>
        <Stack spacing={2}>
          {openSnack && (
            <Alert
              onClose={handleCloseSnack}
              severity={severity}
              sx={{ width: "100%" }}
            >
              {message}
            </Alert>
          )}
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
