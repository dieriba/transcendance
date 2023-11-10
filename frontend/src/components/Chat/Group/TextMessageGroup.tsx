import { Typography, Avatar, Box, Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { GroupConversationBodyProps } from "./GroupConversationBody";
interface TextMessageProps extends GroupConversationBodyProps {
  nickname?: string;
  avatar?: string;
}

const TextMessage = ({
  incoming,
  content,
  nickname,
  avatar,
}: TextMessageProps) => {
  const theme = useTheme();

  return (
    <>
      <Stack>
        {nickname && (
          <Typography alignSelf="flex-start" variant="caption">
            {nickname}
          </Typography>
        )}
        <Stack spacing={1} direction={"row"}>
          <Avatar src={avatar} />
          <Box
            p={1}
            sx={{
              backgroundColor: incoming
                ? theme.palette.background.default
                : theme.palette.primary.main,
              borderRadius: 1.5,
              width: "max-content",
            }}
          >
            <Typography
              variant="body2"
              color={incoming ? theme.palette.text.primary : "#fff"}
            >
              {content}
            </Typography>
          </Box>
        </Stack>
      </Stack>
    </>
  );
};

export default TextMessage;
