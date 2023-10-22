import { Stack } from "@mui/material";
import GroupContact from "../../components/Chat/Group/GroupContact";
const GroupChatPage = () => {
  return (
    <Stack direction="row" sx={{ width: "100%" }}>
      <GroupContact />
    </Stack>
  );
};

export default GroupChatPage;
