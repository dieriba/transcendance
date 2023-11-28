import { Stack } from "@mui/material";
import GroupContact from "./GroupContact";
import GroupConversation from "./GroupConversation";
import { useAppSelector } from "../../../redux/hooks";
import { RootState } from "../../../redux/store";
const GroupMobileChat = () => {
  const currentGroupChatroomId = useAppSelector(
    (state: RootState) => state.groups.currentGroupChatroomId
  );

  return (
    <Stack direction="row" sx={{ width: "100%" }}>
      {!currentGroupChatroomId && <GroupContact />}
      {currentGroupChatroomId && <GroupConversation />}
    </Stack>
  );
};

export default GroupMobileChat;
