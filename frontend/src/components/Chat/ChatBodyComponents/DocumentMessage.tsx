import { Box, IconButton, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DownloadSimple, Image } from "phosphor-react";
import { ChatMessageProps } from "../../../data/data";

const DocumentMessage = ({ incoming, message }: ChatMessageProps) => {
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
            p={2}
            direction="row"
            spacing={3}
            alignItems="center"
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: 1,
            }}
          >
            <Image size={48} />
            <Typography variant="caption">Abstract.png</Typography>
            <IconButton>
              <DownloadSimple />
            </IconButton>
          </Stack>
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

export default DocumentMessage;
