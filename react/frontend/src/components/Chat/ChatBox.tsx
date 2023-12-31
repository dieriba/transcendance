import { Badge, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setPrivateChatroomId } from "../../redux/features/chat/chat.slice";
import { RootState } from "../../redux/store";
import GetAvatar from "../Badge/GetAvatar";
import { StatusType } from "../../models/type-enum/typesEnum";
export interface ChatBoxProps {
  username: string;
  msg: string;
  unread: number;
  avatar: string | undefined;
  time: string;
  chatroomId: string;
  status: StatusType;
}

const ChatBox = ({
  username,
  msg,
  unread,
  avatar,
  time,
  chatroomId,
  status,
}: ChatBoxProps) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const currentPrivateChatroomId = useAppSelector(
    (state: RootState) => state.chat.currentPrivateChatroomId
  );
  const divStyle = {
    width: "100%",
  };
  return (
    <div
      style={divStyle}
      onClick={() => dispatch(setPrivateChatroomId(chatroomId))}
    >
      <Stack
        width="100%"
        direction="row"
        height="100%"
        alignItems="center"
        spacing={2}
        sx={{
          cursor: "pointer",
          width: "100%",
          borderRadius: 1,
          backgroundColor:
            chatroomId !== currentPrivateChatroomId
              ? theme.palette.mode === "light"
                ? "#fff"
                : theme.palette.background.default
              : theme.palette.primary.main,
          color:
            chatroomId === currentPrivateChatroomId
              ? theme.palette.mode === "light"
                ? "#F8FAFF"
                : ""
              : "",
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.mode === "light" ? "#F8FAFF" : "",
          },
        }}
        p={2}
        mb={1}
      >
        <GetAvatar status={status} src={avatar} width="50px" height="50px" />
        <Stack
          direction="row"
          alignItems={"center"}
          width={"100%"}
          justifyContent={"space-between"}
          spacing={2}
        >
          <Stack>
            <Typography
              sx={{
                textOverflow: "ellipsis",
              }}
              width="10px"
              variant="subtitle1"
            >
              {username}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: "1",
                WebkitBoxOrient: "vertical",
              }}
            >
              {msg}
            </Typography>
          </Stack>
          <Stack spacing={2} alignItems="center" pr={2} pb={1.5}>
            <Typography sx={{ fontWeight: 600 }} variant="caption">
              {time}
            </Typography>
            {unread > 0 ? (
              <Badge color="primary" badgeContent={unread}></Badge>
            ) : (
              <Badge color="primary"></Badge>
            )}
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
};

export default ChatBox;
