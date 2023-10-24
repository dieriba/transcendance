import { TextField } from "@mui/material";
import { Control, Controller, FieldValues, Path } from "react-hook-form";
import CustomTextField from "../CustomTextField/CustomTextField";

interface RHFTextFieldProps<T extends FieldValues, U> {
  name: Path<T>;
  label: string;
  control: Control<T, U>;
}

const RHFTextField = <T extends FieldValues, U>({
  name,
  label,
  control,
}: RHFTextFieldProps<T, U>) => {
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
              error={!!error}
            />
          </CustomTextField>
        )}
      />
    </>
  );
};

export default RHFTextField;
