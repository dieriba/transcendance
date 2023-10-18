import { Stack } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ChatContact from "../../components/Chat/ChatContact";
import ChatConversation from "../../components/Chat/ChatConversation/ChatConversation";

const Chat = () => {
  const theme = useTheme();

  return (
    <Stack direction="row" sx={{ width: "100%" }}>
      <ChatContact theme={theme} />
      <ChatConversation theme={theme} />
    </Stack>
  );
};

export default Chat;
