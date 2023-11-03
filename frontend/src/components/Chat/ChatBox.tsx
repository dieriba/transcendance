import { Avatar, Badge, Box, Stack, Typography } from "@mui/material";
import BadgeAvatar from "../Badge/BadgeAvatar";
import { useTheme } from "@mui/material/styles";
import { useAppDispatch, useAppSelector } from "../../redux/hooks";
import { setPrivateChatroomId } from "../../redux/features/chat/chatSlice";
export interface ChatBoxProps {
  username: string;
  msg: string;
  unread: number;
  online: boolean;
  avatar: string | undefined;
  time: string;
  chatroomId: string;
}

const ChatBox = ({
  username,
  msg,
  unread,
  online,
  avatar,
  time,
  chatroomId,
}: ChatBoxProps) => {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const currentPrivateChatroomId = useAppSelector(
    (state) => state.chat.currentPrivateChatroomId
  );
  const divStyle = {
    width: "100%",
  };
  return (
    <div
      style={divStyle}
      onClick={() => dispatch(setPrivateChatroomId(chatroomId))}
    >
      <Box
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
          "&:hover": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.mode === "light" ? "#F8FAFF" : "",
          },
        }}
        p={2}
        mb={1}
      >
        <Stack
          width="100%"
          direction="row"
          height="100%"
          alignItems="center"
          spacing={2}
        >
          {online ? (
            <BadgeAvatar>
              <Avatar src={avatar} />
            </BadgeAvatar>
          ) : (
            <Avatar src={avatar} />
          )}
          <Stack direction="row" spacing={2}>
            <Stack width="10rem">
              {unread > 0 ? (
                <>
                  <Typography variant="subtitle1">{username}</Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: "1",
                      WebkitBoxOrient: "vertical",
                    }}
                    fontWeight="bold"
                  >
                    {msg}
                  </Typography>{" "}
                </>
              ) : (
                <>
                  <Typography variant="subtitle1">{username}</Typography>
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
                </>
              )}
            </Stack>
          </Stack>
          <Stack spacing={2} alignItems="center" pb={1.5}>
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
      </Box>
    </div>
  );
};

export default ChatBox;
