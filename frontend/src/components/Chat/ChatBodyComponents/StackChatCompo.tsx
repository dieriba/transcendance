import { Stack } from "@mui/material";
import { ReactNode } from "react";

interface StackChatCompoProps {
  incoming?: boolean | undefined;
  children: ReactNode;
}

const StackChatCompo = ({ children, incoming }: StackChatCompoProps) => {
  return (
    <Stack
      direction="row"
      mb={1}
      justifyContent={incoming ? "start" : "end"}
    >
      {children}
    </Stack>
  );
};

export default StackChatCompo;
