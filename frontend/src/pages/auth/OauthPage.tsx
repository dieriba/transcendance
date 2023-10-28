import {
  Button,
  CircularProgress,
  Link,
  Stack,
  Typography,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useOauthQuery } from "../../redux/features/auth/auth.api.slice";
import { useQuery } from "../../hooks/useQuery";
import { useAppDispatch } from "../../redux/hooks";
import { authenticateUser } from "../../redux/features/auth/auth.slice";
import { useNavigate } from "react-router-dom";
import { PATH_APP } from "../../routes/paths";
const OauthPage = () => {
  const query = useQuery();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { data, isLoading, isFetching } = useOauthQuery({
    code: query.get("code") as string,
  });

  if (isFetching || isLoading) {
    return (
      <Stack spacing={2} sx={{ alignItems: "center", display: "row", mb: 5 }}>
        <CircularProgress size={50} />
        <Typography>Please wait...</Typography>
      </Stack>
    );
  } else if (data) {
    const { user, access_token } = data.data;
    
    dispatch(authenticateUser({ user, access_token }));
    navigate(PATH_APP.dashboard.games);
  } else {
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
