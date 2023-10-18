import { Avatar, Badge, Box, Stack, Typography } from "@mui/material";
import BadgeAvatar from "../Badge/BadgeAvatar";
import { faker } from "@faker-js/faker";
import { useTheme } from "@mui/material/styles";
export interface ChatBoxProps {
  username: string;
  msg: string;
  time: string;
  unread: number;
  online: boolean;
}

const ChatBox = ({ username, msg, time, unread, online }: ChatBoxProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        width: "100%",
        borderRadius: 1,
        backgroundColor:
          theme.palette.mode === "light"
            ? "#fff"
            : theme.palette.background.default,
      }}
      p={2}
      mb={1}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
          {online ? (
            <BadgeAvatar>
              <Avatar src={faker.image.avatar()} />
            </BadgeAvatar>
          ) : (
            <Avatar src={faker.image.avatar()} />
          )}
        <Stack direction="row" spacing={2}>
          <Stack spacing={0.5} width="10rem">
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
  );
};

export default ChatBox;
