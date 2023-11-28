import {
  Alert,
  AlertColor,
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
import { useState } from "react";
import {
  isFetchBaseQueryError,
  isErrorWithMessage,
} from "../../../services/helpers";
import { useEnable2FaMutation } from "../../../redux/features/user/user.api.slice";
import RHFTextField from "../../controlled-components/RHFTextField";
import { useAppDispatch } from "../../../redux/hooks";
import { updatedTwoFa } from "../../../redux/features/user/user.slice";
import { useTheme } from "@mui/material/styles";
interface QrCodeProps {
  qrCode: string;
  secret: string;
}

const QrCode = ({ qrCode, secret }: QrCodeProps) => {
  const { control, handleSubmit } = useForm<ValidateOtpType>({
    resolver: zodResolver(ValidateOtpSchema),
  });
  const theme = useTheme();
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [openSnack, setOpenSnack] = useState(false);
  const dispatch = useAppDispatch();
  const [enable2Fa, { isLoading }] = useEnable2FaMutation();

  const handleCloseSnack = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };

  const onlyMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  const onSubmit = async (data: ValidateOtpType) => {
    try {
      const res = await enable2Fa(data).unwrap();

      dispatch(updatedTwoFa(true));
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
        setMessage(error.message);
      }
      setOpenSnack(true);
      setSeverity("error");
    }
  };

  return (
    <Stack p={1} spacing={2} alignContent={"flex-start"}>
      {openSnack && (
        <Alert
          onClose={handleCloseSnack}
          severity={severity}
          sx={{ width: "100%" }}
        >
          {message}
        </Alert>
      )}
      <Typography textAlign={'center'}>You are almost there!</Typography>
      <Stack
        direction={onlyMediumScreen ? "column" : "row"}
        alignItems={"center"}
      >
        <Code size={100} />
        <Stack>
          <Typography textAlign={'center'}>
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
