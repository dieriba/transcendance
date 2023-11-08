import { Stack, Box, Divider, Button } from "@mui/material";
import { MagnifyingGlass, Plus } from "phosphor-react";
import { Search, SearchIconWrapper, StyledInputBase } from "../../search";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import CreateGroup from "./CreateGroup";
import { useAppSelector } from "../../../redux/hooks";
import GroupBox from "../GroupBox";
import { RootState } from "../../../redux/store";

const GroupContact = () => {
  const theme = useTheme();
  const [openCreate, setOpenCreate] = useState(false);
  const groups = useAppSelector(
    (state: RootState) => state.groups.groupChatroom
  );
  const myId = useAppSelector((state) => state.user.user?.id);
  console.log({ groups });

  return (
    <>
      <Box
        sx={{
          position: "relative",
          width: 320,
          backgroundColor:
            theme.palette.mode === "light"
              ? "#F8FAFF"
              : theme.palette.background.paper,
          boxShadow: "0px 0px 2px rgba(0, 0, 0, 0.25)",
        }}
      >
        <Stack height="100vh">
          <Stack p={3} sx={{ width: "100%" }} justifyContent="center">
            <Search>
              <SearchIconWrapper>
                <MagnifyingGlass color="#709CE6" />
              </SearchIconWrapper>
              <StyledInputBase placeholder="Search" />
            </Search>
          </Stack>
          <Divider />
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            p={3}
          >
            <Button
              onClick={() => setOpenCreate(true)}
              fullWidth
              endIcon={<Plus />}
            >
              Create New Group
            </Button>
          </Stack>
          <Divider />
          <Stack
            sx={{ flexGrow: 1, overflow: "scroll", height: "100%" }}
            spacing={1}
          >
            <Stack p={2}>
              {groups.map(({ id, chatroomName, type, messages }) => {
                return (
                  <>
                    <GroupBox
                      chatroomId={id}
                      chatroomName={chatroomName}
                      type={type}
                      unread={0}
                      time="11"
                      msg={
                        messages.length === 0
                          ? "Start Conversation"
                          : messages[0].user.id === myId
                          ? `You: ${messages[0].content}`
                          : messages[0].content
                      }
                    />
                  </>
                );
              })}
            </Stack>
          </Stack>
        </Stack>
      </Box>
      <CreateGroup open={openCreate} handleClose={() => setOpenCreate(false)} />
    </>
  );
};

export default GroupContact;
