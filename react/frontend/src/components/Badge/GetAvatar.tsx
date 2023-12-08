import { StatusType } from "../../models/type-enum/typesEnum";
import { Avatar } from "@mui/material";
import BadgeAvatar from "./BadgeAvatar";
import PlayingAvatar from "./PlayingAvatar";
import StyledBadge from "./StyledBadge";

interface GetAvatarProps {
  src: string | undefined;
  status: StatusType | undefined;
  width: string;
  height: string;
  cursor?: boolean;
}

const GetAvatar = ({ src, status, width, height, cursor }: GetAvatarProps) => {
  return (
    <>
      {status === "ONLINE" ? (
        <BadgeAvatar>
          <Avatar
            sx={{ width, height, cursor: cursor ? "pointer" : "" }}
            src={src}
          />
        </BadgeAvatar>
      ) : status === "PLAYING" ? (
        <PlayingAvatar>
          <Avatar
            sx={{ width, height, cursor: cursor ? "pointer" : "" }}
            src={src}
          />
        </PlayingAvatar>
      ) : (
        <StyledBadge
          overlap="circular"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Avatar
            sx={{ width, height, cursor: cursor ? "pointer" : "" }}
            src={src}
          />
        </StyledBadge>
      )}
    </>
  );
};

export default GetAvatar;
