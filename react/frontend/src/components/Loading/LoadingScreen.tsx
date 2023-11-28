import { Box, CircularProgress } from "@mui/material";

export interface LoadingScreenProps {
  size: string;
}

const LoadingScreen = ({ size }: LoadingScreenProps) => {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress size={size} />
    </Box>
  );
};

export default LoadingScreen;
