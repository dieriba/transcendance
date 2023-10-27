import { Stack, Typography } from "@mui/material";
import OauthForm from "../../components/authentication/OauthForm";
const OauthPage = () => {
  return (
    <Stack spacing={2} sx={{ mb: 5, position: "relative" }}>
      <Typography variant="h4">Choose a nickname</Typography>
      <OauthForm />
    </Stack>
  );
};

export default OauthPage;
