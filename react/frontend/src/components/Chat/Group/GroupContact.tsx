import { Stack, Box, Divider, Button, useMediaQuery } from "@mui/material";
import { MagnifyingGlass, Plus } from "phosphor-react";
import { Search, SearchIconWrapper, StyledInputBase } from "../../search";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";
import CreateGroup from "./CreateGroup";
import { useAppSelector } from "../../../redux/hooks";
import GroupBox from "../GroupBox";
import { RootState } from "../../../redux/store";
import JoinGroup from "./JoinGroup";
import GroupInvitation from "./GroupInvitation";

const GroupContact = () => {
  const theme = useTheme();
  const [open, setOpen] = useState<{
    create: boolean;
    join: boolean;
    invitation: boolean;
  }>({
    create: false,
    join: false,
    invitation: false,
  });
  const { groupChatroom, numbersOfGroupInvitation } = useAppSelector(
    (state: RootState) => state.groups
  );

  const myId = useAppSelector((state: RootState) => state.user.user?.id);
  const onlyMediumScreen = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <>
      <Box
        sx={{
          position: "relative",
          width: onlyMediumScreen ? "100%" : 320,
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
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            p={1}
          >
            <Button
              onClick={() => setOpen((prev) => ({ ...prev, create: true }))}
              fullWidth
              endIcon={<Plus />}
              variant="contained"
              color="inherit"
            >
              Create New Group
            </Button>
            <Divider />
            <Button
              onClick={() => setOpen((prev) => ({ ...prev, join: true }))}
              fullWidth
              endIcon={<Plus />}
              variant="contained"
              color="inherit"
            >
              Join group
            </Button>
            <Stack spacing={1} width={"100%"} direction={"row"}>
              <Button
                onClick={() =>
                  setOpen((prev) => ({ ...prev, invitation: true }))
                }
                fullWidth
                variant="contained"
                color="inherit"
              >
                Group Invitation
              </Button>
              <Button disabled color="inherit" variant="contained">
                {numbersOfGroupInvitation}
              </Button>
            </Stack>
          </Stack>
          <Divider />
          <Stack
            sx={{ flexGrow: 1, overflow: "scroll", height: "100%" }}
            spacing={1}
          >
            <Stack p={2}>
              {groupChatroom.map(
                (
                  { id, chatroomName, type, messages, restrictedUsers },
                  index
                ) => {
                  let date: Date | undefined = undefined;
                  const restrictedUser =
                    restrictedUsers.length === 0
                      ? undefined
                      : restrictedUsers[0];
                  if (messages.length > 0)
                    date = new Date(messages[0].createdAt);
                  return (
                    <GroupBox
                      chatroomId={id}
                      chatroomName={chatroomName}
                      type={type}
                      unread={0}
                      time={
                        date
                          ? `${date
                              .getHours()
                              .toString()
                              .padStart(2, "0")}:${date
                              .getMinutes()
                              .toString()
                              .padStart(2, "0")}`
                          : ""
                      }
                      key={index}
                      msg={
                        restrictedUser
                          ? `${restrictedUser.restriction} by ${restrictedUser.admin.user.nickname}`
                          : messages.length === 0
                          ? "Start Conversation"
                          : messages[0].user.id === myId
                          ? `You: ${messages[0].content}`
                          : messages[0].content
                      }
                    />
                  );
                }
              )}
            </Stack>
          </Stack>
        </Stack>
      </Box>
      {open.create && (
        <CreateGroup
          open={open.create}
          handleClose={() => setOpen((prev) => ({ ...prev, create: false }))}
        />
      )}
      {open.join && (
        <JoinGroup
          open={open.join}
          handleClose={() => setOpen((prev) => ({ ...prev, join: false }))}
        />
      )}
      {open.invitation && (
        <GroupInvitation
          open={open.invitation}
          handleClose={() =>
            setOpen((prev) => ({ ...prev, invitation: false }))
          }
        />
      )}
    </>
  );
};

export default GroupContact;
