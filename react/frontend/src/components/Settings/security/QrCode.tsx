import {
  Box,
  Button,
  Divider,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { QrCode as Code } from "phosphor-react";
import {
  ValidateOtpSchema,
  ValidateOtpType,
} from "../../../models/login/UserSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  isFetchBaseQueryError,
  isErrorWithMessage,
} from "../../../services/helpers";
import { useEnable2FaMutation } from "../../../redux/features/user/user.api.slice";
import RHFTextField from "../../controlled-components/RHFTextField";
import { useAppDispatch } from "../../../redux/hooks";
import { updatedTwoFa } from "../../../redux/features/user/user.slice";
import { useTheme } from "@mui/material/styles";
import { showSnackBar } from "../../../redux/features/app/app.slice";
interface QrCodeProps {
  qrCode: string;
  secret: string;
}

const QrCode = ({ qrCode, secret }: QrCodeProps) => {
  const { control, handleSubmit } = useForm<ValidateOtpType>({
    resolver: zodResolver(ValidateOtpSchema),
  });
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const [enable2Fa, { isLoading }] = useEnable2FaMutation();

  const onlyMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  const onSubmit = async (data: ValidateOtpType) => {
    try {
      const res = await enable2Fa(data).unwrap();

      dispatch(updatedTwoFa(true));
      dispatch(showSnackBar({ message: res.message }));
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
    <Stack p={1} spacing={2} alignContent={"flex-start"}>
      <Typography textAlign={"center"}>You are almost there!</Typography>
      <Stack
        direction={onlyMediumScreen ? "column" : "row"}
        alignItems={"center"}
      >
        <Code size={100} />
        <Stack>
          <Typography textAlign={"center"}>
            Please use your authentication app such as Google Authenticator to
            scan the below QR code
          </Typography>
        </Stack>
        <Divider />
      </Stack>
      <Stack
        justifyContent={"space-between"}
        spacing={2}
        direction={onlyMediumScreen ? "column" : "row"}
      >
        <Box alignSelf={onlyMediumScreen ? "center" : "auto"}>
          <img
            src={qrCode}
            height="150px"
            width={onlyMediumScreen ? "240px" : "auto"}
          />
        </Box>
        <Stack
          alignItems={"center"}
          width={"auto"}
          boxShadow={"5px 5px 10px 0px rgba(0, 0, 0, 0.5);"}
          sx={{}}
          p={3}
        >
          <Typography variant="body2" textAlign={"center"}>
            Or enter this code into your authentication app
          </Typography>
          <Divider />
          <Typography fontWeight={"bold"} color={"black"}>
            {secret}
          </Typography>
        </Stack>
      </Stack>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <RHFTextField name="token" label="token" control={control} />
          <Button
            disabled={isLoading}
            fullWidth
            variant="contained"
            color="inherit"
            type="submit"
          >
            ENABLE 2FA
          </Button>
        </Stack>
      </form>
    </Stack>
  );
};

export default QrCode;
