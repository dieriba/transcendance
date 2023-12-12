import {
  Stack,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";
import DialogI from "../../Dialog/DialogI";
import { useEffect, useState } from "react";
import { SocketServerErrorResponse } from "../../../services/type";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks";
import {
  useGetAllJoinableGroupQuery,
  useJoinGroupMutation,
} from "../../../redux/features/groups/group.api.slice";
import {
  addNewChatroom,
  addJoinableGroup,
  deleteJoinableGroup,
  setJoinableGroup,
  deleteGroupInvitation,
} from "../../../redux/features/groups/group.slice";
import { connectSocket, socket } from "../../../utils/getSocket";
import { ChatEventGroup } from "../../../../shared/socket.event";
import { ChatroomGroupType } from "../../../models/groupChat";
import { RootState } from "../../../redux/store";
import GroupIcon from "./GroupIcon";
import { Plus } from "phosphor-react";
import ProtectedGroupForm from "./ProtectedGroupForm";
import { showSnackBar } from "../../../redux/features/app/app.slice";

interface JoinGroupProps {
  open: boolean;
  handleClose: () => void;
}

const JoinGroup = ({ open, handleClose }: JoinGroupProps) => {
  const [joinGroup, joinGroupAction] = useJoinGroupMutation();
  const [openForm, setOpenForm] = useState(false);
  const [chatroomId, setChatroomId] = useState("");

  const { data, isLoading, isError } = useGetAllJoinableGroupQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (data && data.data) {
      dispatch(setJoinableGroup(data.data));
      connectSocket();

      socket.on(
        ChatEventGroup.NEW_AVAILABLE_CHATROOM,
        (data: { data: ChatroomGroupType }) => {
          dispatch(addJoinableGroup(data.data));
        }
      );

      return () => {
        socket.off(ChatEventGroup.NEW_AVAILABLE_CHATROOM);
      };
    }
  }, [data, dispatch]);
  const handleOnclick = async (chatroomId: string, password?: string) => {
    try {
      const res = await joinGroup({ chatroomId, password }).unwrap();
      dispatch(deleteJoinableGroup(chatroomId));
      dispatch(deleteGroupInvitation(chatroomId));
      dispatch(addNewChatroom({ ...res.data, restrictedUsers: [] }));
      dispatch(showSnackBar({ message: res.message }));
    } catch (error) {
      dispatch(
        showSnackBar({
          message: (error as SocketServerErrorResponse).message,
          severity: "error",
        })
      );
    }
  };
  const groups = useAppSelector(
    (state: RootState) => state.groups.joinableGroup
  );

  if (isLoading) {
    return (
      <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
        <CircularProgress size={100} />
      </Stack>
    );
  } else if (isError || !data) {
    return (
      <Stack alignItems="center" height="100%" pt={25} justifyContent="center">
        <Typography>An error has occured</Typography>
      </Stack>
    );
  } else {
    return (
      <>
        <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
          <DialogTitle>Join group</DialogTitle>
          <DialogContent>
            <Stack p={2}>
              {groups.length === 0 ? (
                <Stack alignItems="center" justifyContent="center">
                  <Typography>No group available</Typography>
                </Stack>
              ) : (
                groups.map(({ id, chatroomName, type }, index) => {
                  return (
                    <Stack
                      key={index}
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                    >
                      <GroupIcon size={30} type={type} />
                      <Typography>{chatroomName}</Typography>
                      {type === "PROTECTED" ? (
                        <>
                          <Button
                            onClick={() => {
                              setChatroomId(id);
                              setOpenForm(true);
                            }}
                            startIcon={<Plus />}
                            disabled={joinGroupAction.isLoading}
                          >
                            Join
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            onClick={() => handleOnclick(id)}
                            startIcon={<Plus />}
                            disabled={joinGroupAction.isLoading}
                          >
                            Join
                          </Button>
                        </>
                      )}
                    </Stack>
                  );
                })
              )}
            </Stack>
          </DialogContent>
        </DialogI>
        {openForm && (
          <ProtectedGroupForm
            open={openForm}
            handleClose={() => setOpenForm(false)}
            chatroomId={chatroomId}
          />
        )}
      </>
    );
  }
};

export default JoinGroup;
