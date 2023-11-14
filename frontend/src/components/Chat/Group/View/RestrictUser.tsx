import {
  Stack,
  DialogContent,
  DialogTitle,
  Button,
  TextField,
  ButtonGroup,
  Alert,
  AlertColor,
  Typography,
} from "@mui/material";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import {
  RestrictUserFormSchema,
  RestrictUserType,
} from "../../../../models/groupChat";
import CustomTextField from "../../../CustomTextField/CustomTextField";
import DialogI from "../../../Dialog/DialogI";
import { SocketServerErrorResponse } from "../../../../services/type";
import {
  ChatRoleType,
  DurationUnit,
  Restriction,
  durationUnit,
  restrictionType,
} from "../../../../models/type-enum/typesEnum";
import RHFTextArea from "../../../controlled-components/RHFTextArea";
import {
  BAN_LIFE_VALUE,
  BAN_MAX_DAYS,
  KICK_MAX_DAYS,
  KICK_MAX_HOURS,
  KICK_MAX_MIN,
  MUTE_MAX_DAYS,
  MUTE_MAX_HOURS,
  MUTE_MAX_MIN,
} from "../../../../../../shared/restriction.constant";
import { useRestrictUserMutation } from "../../../../redux/features/groups/group.api.slice";
import { useAppDispatch } from "../../../../redux/hooks";
import { addRestrictedUser } from "../../../../redux/features/groups/group.slice";
interface RestrictUserProps {
  open: boolean;
  nickname: string;
  chatroomId: string;
  handleClose: () => void;
  role: ChatRoleType;
  id: string;
}

const RestrictUser = ({
  open,
  handleClose,
  nickname,
  id,
  role,
  chatroomId,
}: RestrictUserProps) => {
  const { control, handleSubmit, watch, setValue } = useForm<RestrictUserType>({
    resolver: zodResolver(RestrictUserFormSchema),
  });

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

  const restrictionWatcher = watch("restriction");

  const [restrictUser, { isLoading }] = useRestrictUserMutation();

  const theme = useTheme();
  const dispatch = useAppDispatch();
  const onSubmit = async (data: RestrictUserType) => {
    try {
      data.id = id;
      data.chatroomId = chatroomId;
      const res = await restrictUser(data).unwrap();
      console.log({ res });

      dispatch(addRestrictedUser(res.data));
      setMessage(res.message);
      setOpenSnack(true);
      setSeverity("success");
    } catch (error) {
      setSeverity("error");
      setMessage((error as SocketServerErrorResponse).message);
      setOpenSnack(true);
    }
  };

  return (
    <>
      <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
        <DialogTitle>{`Restrict ${nickname}`}</DialogTitle>
        <DialogContent>
          <Stack p={2}>
            <form onSubmit={handleSubmit(onSubmit)}>
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
                <Stack>
                  <Typography variant="caption">Restriction: </Typography>
                  <Controller
                    name="restriction"
                    control={control}
                    defaultValue="MUTED"
                    render={({ field }) => (
                      <ButtonGroup fullWidth>
                        {restrictionType.map((level) => (
                          <Button
                            size="large"
                            key={level}
                            sx={{
                              borderColor:
                                level === field.value
                                  ? theme.palette.primary.main
                                  : "",
                            }}
                            onClick={() => {
                              field.onChange(level);
                              if (level === "BANNED")
                                setValue("durationUnit", "DAYS");
                            }}
                          >
                            {level}
                          </Button>
                        ))}
                      </ButtonGroup>
                    )}
                  />
                </Stack>

                <Stack spacing={1}>
                  <Typography variant="caption">Duration Unit:</Typography>
                  <Controller
                    name="durationUnit"
                    control={control}
                    defaultValue="MIN"
                    render={({ field }) => (
                      <ButtonGroup fullWidth>
                        {durationUnit.map((level) => (
                          <Button
                            size="large"
                            key={level}
                            disabled={
                              level !== DurationUnit.DAYS &&
                              restrictionWatcher === "BANNED"
                            }
                            sx={{
                              borderColor:
                                level === field.value
                                  ? theme.palette.primary.main
                                  : "",
                            }}
                            onClick={() => {
                              field.onChange(level);
                            }}
                          >
                            {level}
                          </Button>
                        ))}
                      </ButtonGroup>
                    )}
                  />
                  <Stack>
                    {restrictionWatcher === Restriction.KICKED ? (
                      <>
                        <Typography color={"gray"} variant="caption">
                          {`User can be kicked at most ${KICK_MAX_MIN} minutes`}
                        </Typography>
                        <Typography color={"gray"} variant="caption">
                          {`User can be kicked at most ${KICK_MAX_HOURS} hours`}
                        </Typography>
                        <Typography color={"gray"} variant="caption">
                          {`User can be kicked at most ${KICK_MAX_DAYS} days`}
                        </Typography>
                      </>
                    ) : restrictionWatcher === Restriction.BANNED ? (
                      <>
                        <Typography color={"gray"} variant="caption">
                          {`User can be banned ${BAN_MAX_DAYS} days or for life`}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography color={"gray"} variant="caption">
                          {`User can be muted at most ${MUTE_MAX_MIN} minutes`}
                        </Typography>
                        <Typography color={"gray"} variant="caption">
                          {`User can be muted at most ${MUTE_MAX_HOURS} hours`}
                        </Typography>
                        <Typography color={"gray"} variant="caption">
                          {`User can be muted at most ${MUTE_MAX_DAYS} days`}
                        </Typography>
                      </>
                    )}
                  </Stack>
                  {role === "DIERIBA" && (
                    <>
                      <Button
                        fullWidth
                        disableElevation
                        color="inherit"
                        variant="contained"
                        onClick={() => {
                          setValue("restriction", "BANNED");
                          setValue("durationUnit", "DAYS");
                          setValue("duration", BAN_LIFE_VALUE);
                        }}
                      >{`Ban life ${nickname}`}</Button>
                    </>
                  )}
                </Stack>

                <Controller
                  name="duration"
                  control={control}
                  render={({
                    field: { value, onChange },
                    fieldState: { error },
                  }) => (
                    <Stack>
                      <Typography variant="caption">Duration:</Typography>
                      <CustomTextField error={error} message={error?.message}>
                        <TextField
                          error={!!error}
                          onChange={onChange}
                          value={value}
                          onKeyDown={(
                            event: React.KeyboardEvent<HTMLDivElement>
                          ) => console.log(event)}
                          type="number"
                          sx={{
                            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                              {
                                display: "none",
                              },
                            "& input[type=number]": {
                              MozAppearance: "textfield",
                            },
                          }}
                        />
                      </CustomTextField>
                    </Stack>
                  )}
                />

                <RHFTextArea
                  rows={4}
                  label="reason"
                  name="reason"
                  control={control}
                />

                <Button
                  color="inherit"
                  fullWidth
                  disabled={isLoading}
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
                  {`Restrict ${nickname}`}
                </Button>
              </Stack>
            </form>
          </Stack>
        </DialogContent>
      </DialogI>
    </>
  );
};

export default RestrictUser;
