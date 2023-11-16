import {
  Button,
  CircularProgress,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useOauthQuery } from "../../redux/features/user/user.api.slice";
import { useQuery } from "../../hooks/useQuery";
import { useAppDispatch } from "../../redux/hooks";
import { authenticateUser } from "../../redux/features/user/user.slice";
import { useNavigate } from "react-router-dom";
import { PATH_APP } from "../../routes/paths";
import { useEffect } from "react";
const OauthPage = () => {
  const query = useQuery();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data, isLoading, isFetching, isError } = useOauthQuery({
    code: query.get("code") as string,
  });

  useEffect(() => {
    if (data) {
      const { user, access_token } = data.data;
      dispatch(authenticateUser({ user, access_token }));
      navigate(PATH_APP.dashboard.profile);
    }
  }, [data, dispatch, navigate]);

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
