import { Stack } from "@mui/material";
import ChatContact from "../../components/Chat/ChatContact";
import ChatConversation from "../../components/Chat/ChatConversation/ChatConversation";

const Chat = () => {
  return (
    <Stack direction="row" sx={{ width: "100%" }}>
      <ChatContact />
      <ChatConversation />
    </Stack>
  );
};

export default Chat;
