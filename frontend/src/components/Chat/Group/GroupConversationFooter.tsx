import { Box, IconButton, Stack } from "@mui/material";
import { PaperPlaneTilt } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAppSelector } from "../../../redux/hooks";
import { RootState } from "../../../redux/store";
import {
  ChatroomGroupType,
  MessageGroupFormSchema,
  MessageGroupFormType,
} from "../../../models/groupChat";
import ChatInput from "../ChatConversation/ChatInput";
import { useSendGroupMessageMutation } from "../../../redux/features/groups/group.api.slice";
import { Restriction } from "../../../models/type-enum/typesEnum";

const GroupConversationFooter = () => {
  const theme = useTheme();

  const methods = useForm<MessageGroupFormType>({
    resolver: zodResolver(MessageGroupFormSchema),
  });

  const { currentGroupChatroomId, currentChatroom } = useAppSelector(
    (state: RootState) => state.groups
  );
  const [sendMessage] = useSendGroupMessageMutation();

  const { control, handleSubmit, reset } = methods;
  const onSubmit = async (data: MessageGroupFormType) => {
    try {
      reset({ content: "" });
      await sendMessage({
        ...data,
        chatroomId: currentGroupChatroomId,
        messageTypes: "TEXT",
      }).unwrap();
    } catch (error) {
      console.log(error);
    }
  };
  const toShow =
    (currentChatroom as ChatroomGroupType).restrictedUsers.length === 0 ||
    (currentChatroom as ChatroomGroupType).restrictedUsers[0].restriction ===
      Restriction.MUTED;

  console.log({
    length: (currentChatroom as ChatroomGroupType).restrictedUsers.length,
  });

  const disabled =
    (currentChatroom as ChatroomGroupType).restrictedUsers.length > 0 &&
    (currentChatroom as ChatroomGroupType).restrictedUsers[0].restriction ===
      Restriction.MUTED;
  return toShow ? (
    <>
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
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack direction="row" spacing={1}>
            <Stack width="100%">
              <ChatInput disabled={disabled} name="content" control={control} />
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
                <IconButton type="submit">
                  <PaperPlaneTilt color="#fff" />
                </IconButton>
              </Stack>
            </Box>
          </Stack>
        </form>
      </Box>
    </>
  ) : (
    <></>
  );
};

export default GroupConversationFooter;
