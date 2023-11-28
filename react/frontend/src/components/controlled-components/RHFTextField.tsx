import { TextField } from "@mui/material";
import {
  Control,
  Controller,
  FieldValues,
  Path,
  PathValue,
} from "react-hook-form";
import CustomTextField from "../CustomTextField/CustomTextField";

interface RHFTextFieldProps<T extends FieldValues, U> {
  name: Path<T>;
  label: string;
  control: Control<T, U>;
  disabled?: boolean;
  defaultValue?: PathValue<T, Path<T>> | undefined;
}

const RHFTextField = <T extends FieldValues, U>({
  name,
  label,
  control,
  disabled,
  defaultValue,
}: RHFTextFieldProps<T, U>) => {
  return (
    <>
      <Controller
        control={control}
        name={name}
        defaultValue={defaultValue}
        render={({ field: { value, onChange }, fieldState: { error } }) => (
          <CustomTextField error={error} message={error?.message}>
            <TextField
              disabled={disabled}
              value={value || ""}
              onChange={onChange}
              label={label}
              fullWidth
              error={!!error}
            />
          </CustomTextField>
        )}
      />
    </>
  );
};

export default RHFTextField;
