import { Box, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { ChatMessageProps } from "../../../data/data";

const ImageMessage = ({ incoming, img, message }: ChatMessageProps) => {
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
            src={img}
            alt={message}
            style={{ maxHeight: 210, borderRadius: "10px" }}
          />
          {message ? (
            <Typography
              variant="body2"
              color={incoming ? theme.palette.text.primary : "#fff"}
            >
              {message}
            </Typography>
          ) : (
            <></>
          )}
        </Stack>
      </Box>
  );
};

export default ImageMessage;
