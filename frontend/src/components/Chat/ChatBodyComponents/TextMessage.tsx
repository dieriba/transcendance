import { Avatar, Box, Stack, Tooltip, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChatConversationBodyProps } from "../ChatConversation/ChatConversationBody";

interface TextMessageProps extends ChatConversationBodyProps {
  nickname?: string;
  avatar: string | undefined;
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
      <Stack mb={1} direction={incoming ? "row-reverse" : "row"} spacing={1}>
        <Tooltip placement="top" title={nickname}>
          <Avatar
            sx={{ width: "30px", height: "30px", alignSelf: "flex-end" }}
            src={avatar}
          />
        </Tooltip>
        <Box
          p={1}
          mt={3}
          sx={{
            backgroundColor: theme.palette.background.default,
            borderRadius: 1.5,
            maxWidth: "500px",
            overflowWrap: "break-word",
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
    </>
  );
};

export default TextMessage;
