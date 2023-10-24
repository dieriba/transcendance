import { Box, Stack, Typography } from "@mui/material";
import { FallbackProps } from "react-error-boundary";

export function StandardError(props: FallbackProps) {

  return (
    <>
      <Stack alignItems="center" height="100vh" justifyContent="center">
        <Typography>An Error has occured</Typography>
      </Stack>
    </>
  );
}
