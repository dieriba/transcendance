import {
  Stack,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Autocomplete,
  ButtonGroup,
} from "@mui/material";
import DialogI from "../../Dialog/DialogI";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import {
  CreateGroupFormType,
  CreateGroupSchema,
} from "../../../models/CreateGroupSchema";
import { useTheme } from "@mui/material/styles";
import { Eye, EyeSlash } from "phosphor-react";
import CustomTextField from "../../CustomTextField/CustomTextField";
import { useState } from "react";
import RHFTextField from "../../controlled-components/RHFTextField";

interface CreateGroupProps {
  open: boolean;
  handleClose: () => void;
}

const CreateGroup = ({ open, handleClose }: CreateGroupProps) => {
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitSuccessful, isSubmitting },
  } = useForm<CreateGroupFormType>({
    resolver: zodResolver(CreateGroupSchema),
  });

  const protectedType = watch("type");
  const [showPassword, setShowPassword] = useState(false);

  const theme = useTheme();

  const onSubmit = async (data: CreateGroupFormType) => {
    console.log(data);
  };

  const user = ["dieri", "bala", "nabs"];
  const accessLevels = ["PUBLIC", "PRIVATE", "PROTECTED"];
  return (
    <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        <Stack p={2}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <RHFTextField
                name="chatroomName"
                label="chatroomName"
                control={control}
              />

              <Controller
                name="type"
                control={control}
                defaultValue="PUBLIC"
                render={({ field }) => (
                  <ButtonGroup fullWidth>
                    {accessLevels.map((level) => (
                      <Button
                        size="large"
                        key={level}
                        sx={{
                          borderColor:
                            level === field.value
                              ? theme.palette.primary.main
                              : "",
                        }}
                        onClick={() => {
                          field.onChange(level);
                          setValue("password", "");
                        }}
                      >
                        {level}
                      </Button>
                    ))}
                  </ButtonGroup>
                )}
              />

              <Controller
                name="password"
                control={control}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <CustomTextField error={error} message={error?.message}>
                    <TextField
                      disabled={protectedType === "PROTECTED" ? false : true}
                      label="password"
                      fullWidth
                      value={value || ""}
                      onChange={onChange}
                      error={!!error}
                      type={showPassword ? "text" : "password"}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword((prev) => !prev)}
                            >
                              {showPassword ? <Eye /> : <EyeSlash />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </CustomTextField>
                )}
              />

              <Controller
                name="users"
                control={control}
                defaultValue={undefined}
                render={({
                  field: { value, onChange },
                  fieldState: { error },
                }) => (
                  <Autocomplete
                    options={user}
                    multiple
                    getOptionLabel={(option) => option}
                    onChange={(_, selectedOption) => onChange(selectedOption)}
                    renderInput={(params) => (
                      <CustomTextField error={error} message={error?.message}>
                        <TextField {...params} error={!!error} />
                      </CustomTextField>
                    )}
                    onClick={() => {
                      console.log(value);
                    }}
                  />
                )}
              />
              <Button
                color="inherit"
                fullWidth
                size="large"
                type="submit"
                variant="contained"
                sx={{
                  ":hover": {
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 1.5,
                    color: "white",
                  },
                }}
                disableElevation={true}
              >
                Create Group
              </Button>
            </Stack>
          </form>
        </Stack>
      </DialogContent>
    </DialogI>
  );
};

export default CreateGroup;
