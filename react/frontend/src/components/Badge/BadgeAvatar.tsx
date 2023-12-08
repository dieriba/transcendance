import { ReactNode } from "react";
import StyledBadge from "./StyledBadge";


interface BadgeAvatarProps {
  children: ReactNode;
}

const BadgeAvatar = ({ children }: BadgeAvatarProps) => {
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

export default BadgeAvatar;
