import {
  Alert,
  AlertColor,
  Avatar,
  Box,
  Button,
  Stack,
  Typography,
} from "@mui/material";
import { styled, useTheme } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { CloudArrowUp } from "phosphor-react";
import {
  UploadAvatarSchema,
  UploadAvatarType,
} from "../../models/NewAvatarSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import CustomTextField from "../../components/CustomTextField/CustomTextField";
import {
  useChangeAvatarMutation,
  useNotifyNewProfilePicMutation,
} from "../../redux/features/user/user.api.slice";
import { setNewAvatarSrc } from "../../redux/features/user/user.slice";
import {
  isErrorWithMessage,
  isFetchBaseQueryError,
} from "../../services/helpers";
const ProfilePage = () => {
  const user = useAppSelector((state) => state.user.user);

  const VisuallyHiddenInput = styled("input")({
    clip: "rect(0 0 0 0)",
    clipPath: "inset(50%)",
    height: 1,
    overflow: "hidden",
    position: "absolute",
    bottom: 0,
    left: 0,
    whiteSpace: "nowrap",
    width: 1,
  });

  const { control, handleSubmit, reset } = useForm<UploadAvatarType>({
    resolver: zodResolver(UploadAvatarSchema),
  });
  const dispatch = useAppDispatch();
  const [file, setFile] = useState<File>();
  const [image, setImage] = useState<string | undefined>(undefined);
  const [changeAvatar, { isLoading }] = useChangeAvatarMutation();
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<AlertColor>("success");
  const [openSnack, setOpenSnack] = useState(false);
  const [notifyNewProfilePic] = useNotifyNewProfilePicMutation();
  const handleCloseSnack = (
    _event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenSnack(false);
  };

  const loadImage = (file: Blob) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();

      reader.readAsDataURL(file as Blob);
      reader.onload = () =>
        typeof reader.result === "string"
          ? resolve(reader.result)
          : reject(reader.result);
      reader.onerror = (error) => reject(error);
    });

  useEffect(() => {
    if (file)
      loadImage(file)
        .then(setImage)
        .catch(() => setImage(undefined));
  }, [file]);

  const onSubmit = async ({ avatar }: UploadAvatarType) => {
    try {
      const formData = new FormData();
      console.log({ avatar: avatar[0] });

      formData.append("avatar", avatar[0]);

      const { message, data } = await changeAvatar(formData).unwrap();

      dispatch(setNewAvatarSrc(data.data));
      notifyNewProfilePic(data.data);
      setMessage(message);
      setSeverity("success");
      setOpenSnack(true);
    } catch (err) {
      setSeverity("error");
      setOpenSnack(true);

      if (isErrorWithMessage(err)) {
        setMessage(err.message);
      } else if (isFetchBaseQueryError(err)) {
        if (err.data && typeof err.data === "object" && "message" in err.data) {
          setMessage(err.data.message as string);
        } else {
          setMessage("An error has occured, please try again later!");
        }
      }
    }
  };

  const theme = useTheme();
  return (
    <>
      <Stack direction={"row"} sx={{ width: "100%" }}>
        <Box
          sx={{
            position: "relative",
            width: 320,
            backgroundColor:
              theme.palette.mode === "light"
                ? "#F8FAFF"
                : theme.palette.background.paper,
            boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
          }}
        >
          <Stack p={4} alignItems={"center"} spacing={5}>
            <Stack direction="row" alignItems="center" spacing={3}>
              <Typography variant="h5">Profile</Typography>
            </Stack>
            {openSnack && (
              <Alert
                onClose={handleCloseSnack}
                severity={severity}
                sx={{ width: "100%" }}
              >
                <Typography variant="caption">{message}</Typography>
              </Alert>
            )}
            <Stack spacing={2} alignItems={"center"}>
              {image ? (
                <>
                  <Stack spacing={1} alignItems="center" fontStyle={"italic"}>
                    <Button
                      onClick={() => {
                        setImage(undefined);
                        reset();
                      }}
                      fullWidth
                      color="inherit"
                    >
                      Remove Preview
                    </Button>
                    <Avatar sx={{ width: 100, height: 100 }} src={image} />
                  </Stack>
                </>
              ) : (
                <>
                  <Avatar
                    sx={{ width: 100, height: 100 }}
                    src={
                      user?.profile?.avatar ? user?.profile.avatar : undefined
                    }
                  />
                </>
              )}
              <form onSubmit={handleSubmit(onSubmit)}>
                <Stack spacing={2} alignItems={"center"}>
                  <Controller
                    name="avatar"
                    control={control}
                    render={({
                      field: { ref, name, onChange },
                      fieldState: { error },
                    }) => (
                      <CustomTextField error={error} message={error?.message}>
                        <Button
                          fullWidth
                          component="label"
                          variant="contained"
                          startIcon={<CloudArrowUp />}
                          color="inherit"
                        >
                          Choose new avatar
                          <VisuallyHiddenInput
                            onChange={(e) => {
                              onChange(e.target.files);
                              if (e.target.files && e.target.files.length > 0) {
                                setFile(e.target.files[0]);
                              }
                            }}
                            ref={ref}
                            name={name}
                            type="file"
                            accept="image.jpg,image/jpeg,image/png"
                          />
                        </Button>
                      </CustomTextField>
                    )}
                  />
                  {image && (
                    <Button
                      variant="contained"
                      fullWidth
                      size="medium"
                      color="inherit"
                      type="submit"
                      disabled={isLoading}
                    >
                      Upload Avatar
                    </Button>
                  )}
                </Stack>
              </form>
            </Stack>
          </Stack>
        </Box>
      </Stack>
    </>
  );
};

export default ProfilePage;
