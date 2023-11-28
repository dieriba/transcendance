import { TextField } from "@mui/material";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import CustomTextField from "../CustomTextField/CustomTextField";

interface RHFTextAreaProps<T extends FieldValues, U> {
  name: Path<T>;
  label: string;
  control: Control<T, U>;
  rows: number;
}

const RHFTextArea = <T extends FieldValues, U>({
  name,
  label,
  control,
  rows,
}: RHFTextAreaProps<T, U>) => {
  return (
    <>
      <Controller
        control={control}
        name={name}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <CustomTextField error={error} message={error?.message}>
            <TextField
              value={value || ""}
              onChange={onChange}
              label={label}
              fullWidth
              rows={rows}
              multiline
              error={!!error}
            />
          </CustomTextField>
        )}
      />
    </>
  );
};

export default RHFTextArea;
