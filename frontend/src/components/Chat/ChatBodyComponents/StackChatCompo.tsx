import { Stack } from "@mui/material";
import { ReactNode } from "react";

interface StackChatCompoProps {
  children: ReactNode;
}

const StackChatCompo = ({ children }: StackChatCompoProps) => {
  return (
    <Stack direction="row" mb={1} justifyContent={"start"}>
      {children}
    </Stack>
  );
};

export default StackChatCompo;
