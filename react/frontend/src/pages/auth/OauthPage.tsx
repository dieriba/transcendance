import {
  Button,
  CircularProgress,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  useDisconnectAllExceptMeMutation,
  useOauthQuery,
} from "../../redux/features/user/user.api.slice";
import { useQuery } from "../../hooks/useQuery";
import { useAppDispatch } from "../../redux/hooks";
import {
  authenticateUser,
  setTwoFaId,
} from "../../redux/features/user/user.slice";
import { useNavigate } from "react-router-dom";
import { PATH_APP } from "../../routes/paths";
import { useEffect } from "react";
import {
  ResponseTwoFaLoginSchema,
  ResponseLoginSchema,
  ResponseLoginType,
  ResponseTwoFaLoginType,
} from "../../models/login/ResponseLogin";
import { setMyId } from "../../redux/features/groups/group.slice";
const OauthPage = () => {
  const query = useQuery();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError } = useOauthQuery({
    code: query.get("code") as string,
  });
  const [disconnectAllInstanceExceptMe] = useDisconnectAllExceptMeMutation();

  useEffect(() => {
    const login = async (data: ResponseLoginType | ResponseTwoFaLoginType) => {
      const twoFaParse = await ResponseTwoFaLoginSchema.safeParseAsync(data);

      if (twoFaParse.success) {
        dispatch(setTwoFaId((data as ResponseTwoFaLoginType).id));
        navigate(PATH_APP.auth.twoFa);
        return;
      }

      const parse = await ResponseLoginSchema.safeParseAsync(data);

      if (parse.success) {
        const { user, access_token } = data as ResponseLoginType;
        dispatch(authenticateUser({ user, access_token }));
        dispatch(setMyId(user.id));
        await disconnectAllInstanceExceptMe().unwrap();
        navigate(PATH_APP.dashboard.profile, { replace: true });
      }
    };

    if (data) {
      login(data.data);
    }
  }, [data, dispatch, navigate, disconnectAllInstanceExceptMe]);

  if (isFetching || isLoading) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", display: "row", mb: 5 }}>
        <CircularProgress size={50} />
        <Typography>Please wait...</Typography>
      </Stack>
    );
  } else if (isError) {
    return (
      <Stack sx={{ alignItems: "center", display: "row", mb: 5 }}>
        <Typography variant="h5">An error has occured</Typography>
        <Link to={PATH_APP.auth.login} component={RouterLink}>
          <Stack justifyContent="center">
            <Button>Go back to login</Button>
          </Stack>
        </Link>
      </Stack>
    );
  }
};

export default OauthPage;
