import { Stack } from "@mui/material";
import { ReactNode } from "react";

interface StackChatCompoProps {
  children: ReactNode;
  incoming: boolean;
}

const StackChatCompo = ({ children, incoming }: StackChatCompoProps) => {
  return (
    <Stack direction="row" mb={1} justifyContent={incoming ? "end" : "start"}>
      {children}
    </Stack>
  );
};

export default StackChatCompo;
