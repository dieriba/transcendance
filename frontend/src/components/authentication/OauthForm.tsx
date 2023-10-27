import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stack, Button, CircularProgress } from "@mui/material";

import { useTheme } from "@mui/material";

import { useState } from "react";
import RHFTextField from "../controlled-components/RHFTextField";
import { useOauthMutation } from "../../redux/features/auth/auth.api.slice";
import {
  isFetchBaseQueryError,
  isErrorWithMessage,
} from "../../services/helpers";
import { useAppDispatch } from "../../redux/hooks";
import { authenticateUser } from "../../redux/features/auth/auth.slice";
import { ResponseLoginSchema } from "../../models/login/ResponseLogin";
import { useNavigate } from "react-router-dom";
import { PATH_APP } from "../../routes/paths";
import CustomAlert from "../Alert/CustomAlert";
import { OauthFormType, OauthSchema } from "../../models/login/OauthSchema";
import { useQuery } from "../../hooks/useQuery";

const OauthForm = () => {
  const methods = useForm<OauthFormType>({
    resolver: zodResolver(OauthSchema),
  });

  const { handleSubmit, control } = methods;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [oauth, { isLoading, error, reset }] = useOauthMutation();
  const [errMsg, setErrMsg] = useState("");
  const query = useQuery();

  const onSubmit = async (data: OauthFormType) => {
    try {
      data.code = query.get("code") as string;

      console.log(data);

      const result = await oauth(data).unwrap();

      console.log(result);

      const parse = await ResponseLoginSchema.safeParseAsync(result.data);
      if (!parse.success) {
        setErrMsg("An error has occured, please try again later!");
      } else {
        const data = parse.data;
        dispatch(authenticateUser(data));
        methods.reset();
        navigate(PATH_APP.dashboard.games);
      }
    } catch (err) {
      if (isFetchBaseQueryError(err)) {
        if (err.data && typeof err.data === "object" && "message" in err.data) {
          setErrMsg(err.data.message as string);
        } else {
          setErrMsg("An error has occured, please try again later!");
        }
      } else if (isErrorWithMessage(err)) {
        setErrMsg(err.message);

        console.log(err);
      }
    }
  };
  const theme = useTheme();

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack spacing={3}>
        {(error || errMsg.length > 0) && (
          <>
            <CustomAlert
              severity="error"
              reset={reset}
              setMsg={setErrMsg}
              msg={errMsg}
            />
          </>
        )}
        <RHFTextField name="nickname" label="Nickname" control={control} />

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
          {isLoading ? <CircularProgress size={20} /> : "Finalise account"}
        </Button>
      </Stack>
    </form>
  );
};
export default OauthForm;
