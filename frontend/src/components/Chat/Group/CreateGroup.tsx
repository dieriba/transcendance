import {
  Stack,
  DialogContent,
  DialogTitle,
  Button,
  IconButton,
  InputAdornment,
  TextField,
  Autocomplete,
} from "@mui/material";
import DialogI from "../../Dialog/DialogI";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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

  const user = ["dieri", "bala", "nabs"];

  return (
    <DialogI open={open} handleClose={handleClose}>
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
                  label="Email"
                  fullWidth
                  error={!!errors.chatroomName}
                />
              </CustomTextField>
              {isProtectedGroup && (
                <CustomTextField
                  error={errors.password}
                  message={errors.password?.message}
                >
                  <TextField
                    {...methods.register("password")}
                    label="Password"
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
              )}
              <Autocomplete
                {...methods.register("users")}
                multiple
                id="tags-outlined"
                options={user}
                filterSelectedOptions
                ChipProps={{ size: "medium" }}
                renderInput={(params) => (
                  <TextField {...params} label="Add User" placeholder="Users" />
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
