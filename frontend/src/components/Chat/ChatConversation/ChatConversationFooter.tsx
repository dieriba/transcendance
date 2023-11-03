import { Box, IconButton, Stack } from "@mui/material";
import { PaperPlaneTilt } from "phosphor-react";
import { useTheme } from "@mui/material/styles";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { Theme } from "emoji-picker-react";
import ChatInput from "./ChatInput";
import { useBoolean } from "usehooks-ts";
import {
  MessageFormSchema,
  MessageFormType,
} from "../../../models/ChatContactSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useSendPrivateMessageMutation } from "../../../redux/features/chat/chats.api.slice";
import { useAppSelector } from "../../../redux/hooks";

const ChatConversationFooter = () => {
  const theme = useTheme();

  const methods = useForm<MessageFormType>({
    resolver: zodResolver(MessageFormSchema),
  });

  const chatroom = useAppSelector((state) => state.chat.currentChatroom);
  const [sendMessage] = useSendPrivateMessageMutation();

  const { control, handleSubmit, reset, setValue, getValues } = methods;
  const onSubmit = async (data: MessageFormType) => {
    try {
      reset({ content: "" });
      await sendMessage({
        ...data,
        chatroomId: chatroom.id,
        friendId: chatroom.users[0].user.id,
        messageTypes: "TEXT",
      }).unwrap();
      console.log("{ res }");
      console.log("Form reset successful"); // Add this line for debugging
    } catch (error) {
      console.log(error);
    }
  };
  const handleEmoji = (emoji: EmojiClickData) => {
    setValue("content", getValues("content") + emoji.emoji);
  };

  const { value, toggle } = useBoolean(false);
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
          <Stack direction="row" spacing={3}>
            <Stack width="100%">
              <Box
                sx={{
                  display: value ? "inline" : "none",
                  zIndex: 10,
                  position: "fixed",
                  bottom: 56,
                  right: 80,
                }}
              >
                <EmojiPicker
                  theme={
                    theme.palette.mode === "light" ? Theme.LIGHT : Theme.DARK
                  }
                  onEmojiClick={handleEmoji}
                />
              </Box>
              <ChatInput name="content" control={control} toggle={toggle} />
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
