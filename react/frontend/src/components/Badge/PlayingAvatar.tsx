import { ReactNode } from "react";
import StyledBadge from "./StyledBadge";
import { GameController } from "phosphor-react";

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
      <GameController />
    </StyledBadge>
  );
};

export default PlayingAvatar;
