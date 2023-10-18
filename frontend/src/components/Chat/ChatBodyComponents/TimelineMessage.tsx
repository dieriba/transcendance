import { Divider, Stack, Typography, useTheme } from "@mui/material";
import { ChatMessageProps } from "../../../data/data";

const TimelineMessage = ({ text }: ChatMessageProps) => {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      mb={2}
    >
      <Divider sx={{ width: "46%" }} />
      <Typography variant="caption" color={theme.palette.text.primary}>
        {text}
      </Typography>
      <Divider sx={{ width: "46%" }} />
    </Stack>
  );
};

export default TimelineMessage;
