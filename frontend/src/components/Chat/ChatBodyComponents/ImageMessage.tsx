import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChatConversationBodyProps } from "../ChatConversation/ChatConversationBody";

interface ImageMessageProps extends ChatConversationBodyProps {
  image: string;
}

const ImageMessage = ({ incoming, image, content }: ImageMessageProps) => {
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
      <Stack spacing={1}>
        <img
          src={image}
          alt={content}
          style={{ maxHeight: 210, borderRadius: "10px" }}
        />
        {content ? (
          <Typography
            variant="body2"
            color={incoming ? theme.palette.text.primary : "#fff"}
          >
            {content}
          </Typography>
        ) : (
          <></>
        )}
      </Stack>
    </Box>
  );
};

export default ImageMessage;
