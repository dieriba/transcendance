import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChatMessageProps } from "../../../data/data";
import { ChatConversationBodyProps } from "../ChatConversation/ChatConversationBody";

interface ReplyMessageProps extends ChatConversationBodyProps {
  reply: string;
}

const ReplyMessage = ({ incoming, reply, content }: ReplyMessageProps) => {
  const theme = useTheme();

  return (
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
      <Stack spacing={2}>
        <Stack
          direction="column"
          alignItems="center"
          sx={{
            backgroundColor: theme.palette.background.paper,
            borderRadius: 1,
          }}
          p={1}
        >
          <Typography variant="body2" color={theme.palette.text.primary}>
            {content}
          </Typography>
        </Stack>
        <Typography
          variant="body2"
          color={incoming ? theme.palette.text.primary : "#fff"}
        >
          {reply}
        </Typography>
      </Stack>
    </Box>
  );
};

export default ReplyMessage;
