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

interface CreateGroupProps {
  open: boolean;
  handleClose: () => void;
}

const CreateGroup = ({ open, handleClose }: CreateGroupProps) => {
  const methods = useForm<CreateGroupFormType>({
    resolver: zodResolver(CreateGroupSchema),
  });

  const { errors, isSubmitting, isSubmitSuccessful } = methods.formState;

  const [isProtectedGroup, setIsProtectedGroup] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const theme = useTheme();

  const onSubmit = async (data: CreateGroupFormType) => {
    console.log(data);
  };

  const handleButton = () => {};

  const user = ["dieri", "bala", "nabs"];
  const accessLevels = ["PUBLIC", "PRIVATE", "PROTECTED"];
  return (
    <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        <Stack p={2}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Stack spacing={3}>
              <CustomTextField
                error={errors.chatroomName}
                message={errors.chatroomName?.message}
              >
                <TextField
                  {...methods.register("chatroomName")}
                  label="chatroomName"
                  fullWidth
                  error={!!errors.chatroomName}
                />
              </CustomTextField>
              <Controller
                name="type"
                control={methods.control}
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
                          if (level === "PROTECTED") {
                            setIsProtectedGroup(true);
                          } else {
                            setIsProtectedGroup(false);
                            methods.reset({ password: "" });
                          }
                        }}
                      >
                        {level}
                      </Button>
                    ))}
                  </ButtonGroup>
                )}
              />

              <CustomTextField
                error={errors.password}
                message={errors.password?.message}
              >
                <TextField
                  disabled={isProtectedGroup ? false : true}
                  {...methods.register("password")}
                  label="password"
                  fullWidth
                  error={!!errors.password}
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

              <Controller
                name="users"
                control={methods.control}
                defaultValue={undefined}
                render={({ field: { value, onChange } }) => (
                  <Autocomplete
                    options={user}
                    multiple
                    getOptionLabel={(option) => option}
                    onChange={(_, selectedOption) => onChange(selectedOption)}
                    renderInput={(params) => (
                      <CustomTextField
                        error={errors.users}
                        message={errors.users?.message}
                      >
                        <TextField {...params} error={!!errors.users} />
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
