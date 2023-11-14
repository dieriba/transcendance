import { TextField } from "@mui/material";
import { styled } from "@mui/material/styles";
import { Control, Controller, FieldValues, Path } from "react-hook-form";

interface ChatInputProps<T extends FieldValues, U> {
  control: Control<T, U>;
  name: Path<T>;
  disabled?: boolean;
}

const StyledInput = styled(TextField)(() => ({
  "& .MuiInputBase-input": {
    paddingTop: "12px !important",
    paddingBottom: "12px !important",
  },
}));

const ChatInput = <T extends FieldValues, U>({
  control,
  name,
  disabled,
}: ChatInputProps<T, U>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { value, onChange } }) => (
        <StyledInput
          disabled={disabled}
          fullWidth
          autoComplete="off"
          value={value || ""}
          onChange={onChange}
          variant="filled"
          placeholder="Send a message..."
        />
      )}
    />
  );
};

export default ChatInput;
