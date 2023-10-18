import { Box, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChatMessageProps } from "../../../data/data";

const TextMessage = ({ incoming, message }: ChatMessageProps) => {
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
          {message}
        </Typography>
      </Box>
    </>
  );
};

export default TextMessage;
