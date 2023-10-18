import { Box, IconButton, Stack } from "@mui/material";
import { PaperPlaneTilt } from "phosphor-react";
import { useTheme } from "@mui/material/styles";

import data from "@emoji-mart/data";
import ChatInput from "./ChatInput";
import EmojiPicker from "../../Picker/EmojiPicker";
import { useBoolean } from "usehooks-ts";

const ChatConversationFooter = () => {
  const theme = useTheme();

  const { value, toggle } = useBoolean(false);
  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor:
          theme.palette.mode === "light"
            ? "#F8FAFF"
            : theme.palette.background.paper,
        boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25",
      }}
      p={1}
    >
      <Stack direction="row" spacing={3}>
        <Stack width="100%">
          <Box
            sx={{
              display: value ? "inline" : "none",
              zIndex: 10,
              position: "fixed",
              bottom: 56,
              right: 80,
            }}
          >
            <EmojiPicker
              theme={theme.palette.mode}
              data={data}
              onEmojiSelect={console.log}
            />
          </Box>
          <ChatInput toggle={toggle} />
        </Stack>
        <Box
          sx={{
            height: 48,
            width: 48,
            backgroundColor: theme.palette.primary.main,
            borderRadius: 1.5,
          }}
        >
          <Stack
            sx={{
              height: "100%",
              width: "100%",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <IconButton>
              <PaperPlaneTilt color="#fff" />
            </IconButton>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
};

export default ChatConversationFooter;
