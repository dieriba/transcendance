import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChatConversationBodyProps } from "../ChatConversation/ChatConversationBody";

interface TextMessageProps extends ChatConversationBodyProps {}

const TextMessage = ({ incoming, content }: TextMessageProps) => {
  const theme = useTheme();

  return (
    <>
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
    </>
  );
};

export default TextMessage;
