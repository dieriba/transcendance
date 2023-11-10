import { Box, Stack } from "@mui/material";
import GroupConversationHeader from "./GroupConversationHeader";
import GroupConversationBody from "./GroupConversationBody";
import GroupConversationFooter from "./GroupConversationFooter";
import { useTheme } from "@mui/material/styles";
import GroupComp from "./GroupComp";
import { RootState } from "../../../redux/store";
import { useAppSelector } from "../../../redux/hooks";

const GroupConversation = () => {
  const theme = useTheme();
  const open = useAppSelector(
    (state: RootState) => state.sidebar.openGroupSidebar
  );
  return (
    <>
      <Box
        sx={{
          height: "100%",
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F0F4FA"
              : theme.palette.background.paper,
          width: open ? "calc(100vw - 740px)" : "calc(100vw - 420px)",
        }}
      >
        <Stack height="100%" maxHeight="100vh" width="auto">
          <GroupConversationHeader />
          <GroupConversationBody />
          <GroupConversationFooter />
        </Stack>
      </Box>
      {open && <GroupComp />}
    </>
  );
};

export default GroupConversation;
