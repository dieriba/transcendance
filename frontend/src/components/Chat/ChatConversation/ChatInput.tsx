import { InputAdornment, IconButton, TextField } from "@mui/material";
import { FolderSimplePlus, Smiley } from "phosphor-react";
import { styled } from "@mui/material/styles";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface ChatInputProps<T extends FieldValues, U> {
  toggle: () => void;
  control: Control<T, U>;
  name: Path<T>;
}

const StyledInput = styled(TextField)(() => ({
  "& .MuiInputBase-input": {
    paddingTop: "12px !important",
    paddingBottom: "12px !important",
  },
}));

const ChatInput = <T extends FieldValues, U>({
  toggle,
  control,
  name,
}: ChatInputProps<T, U>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <StyledInput
          fullWidth
          value={value || ""}
          onChange={onChange}
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
      )}
    />
  );
};

export default ChatInput;
