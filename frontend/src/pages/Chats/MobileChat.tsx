import { Stack } from "@mui/material";
import ChatContact from "../../components/Chat/ChatContact";
import ChatConversation from "../../components/Chat/ChatConversation/ChatConversation";
import { RootState } from "../../redux/store";
import { useAppSelector } from "../../redux/hooks";

const MobileChat = () => {
  const { currentPrivateChatroomId } = useAppSelector(
    (state: RootState) => state.chat
  );
  return (
    <Stack direction="row" sx={{ width: "100%" }}>
      {!currentPrivateChatroomId && <ChatContact />}
      {currentPrivateChatroomId && (
        <>
          <ChatConversation />
        </>
      )}
    </Stack>
  );
};

export default MobileChat;
