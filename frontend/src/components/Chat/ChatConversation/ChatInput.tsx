import { InputAdornment, IconButton, TextField } from "@mui/material";
import { FolderSimplePlus, Smiley } from "phosphor-react";
import { styled } from "@mui/material/styles";

interface ChatInputProps {
  toggle: () => void;
}

const StyledInput = styled(TextField)(() => ({
  "& .MuiInputBase-input": {
    paddingTop: "12px !important",
    paddingBottom: "12px !important",
  },
}));

const ChatInput = ({ toggle }: ChatInputProps) => {
  return (
    <StyledInput
      fullWidth
      variant="filled"
      placeholder="Send a message..."
      InputProps={{
        startAdornment: (
          <InputAdornment position="end">
            <IconButton sx={{ mr: 2 }}>
              <FolderSimplePlus size={30} />
            </IconButton>
          </InputAdornment>
        ),
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={toggle}>
              <Smiley />
            </IconButton>
          </InputAdornment>
        ),
      }}
    />
  );
};

export default ChatInput;
