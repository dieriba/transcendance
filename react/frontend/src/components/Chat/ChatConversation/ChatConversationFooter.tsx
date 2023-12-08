import { Box, IconButton, Stack } from "@mui/material";
import { PaperPlaneTilt } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import ChatInput from "./ChatInput";
import {
  MessageFormSchema,
  MessageFormType,
} from "../../../models/ChatContactSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSendPrivateMessageMutation } from "../../../redux/features/chat/chats.api.slice";
import { useAppSelector } from "../../../redux/hooks";
import { RootState } from "../../../redux/store";

const ChatConversationFooter = () => {
  const theme = useTheme();

  const methods = useForm<MessageFormType>({
    resolver: zodResolver(MessageFormSchema),
  });

  const chatroom = useAppSelector(
    (state: RootState) => state.chat.currentChatroom
  );
  const [sendMessage] = useSendPrivateMessageMutation();

  const { control, handleSubmit, reset } = methods;
  const onSubmit = async (data: MessageFormType) => {
    try {
      reset({ content: "" });
      await sendMessage({
        ...data,
        chatroomId: chatroom?.id,
        friendId: chatroom?.users[0].user.id,
      }).unwrap();
    } catch (error) {
      /* */
    }
  };

  return (
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
              <ChatInput name="content" control={control} />
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
  );
};

export default ChatConversationFooter;
