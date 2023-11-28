import { ReactNode } from "react";
import StyledBadge from "./StyledBadge";
import { Button, Stack } from "@mui/material";

interface PlayingAvatarProps {
  children: ReactNode;
}

const PlayingAvatar = ({ children }: PlayingAvatarProps) => {
  return (
    <StyledBadge
      overlap="circular"
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      variant="dot"
    >
      {children}
    </StyledBadge>
  );
};

export default PlayingAvatar;
