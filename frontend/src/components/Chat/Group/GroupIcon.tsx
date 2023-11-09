import { GroupTypeEnum } from "../../../models/groupChat";
import { Tooltip } from "@mui/material";
import { EyeSlash, Shield, UsersFour } from "phosphor-react";

interface GroupIconProps {
  type: "PUBLIC" | "PROTECTED" | "PRIVATE";
  size: number;
}

const GroupIcon = ({ type, size }: GroupIconProps) => {
  switch (type) {
    case "PROTECTED":
      return (
        <Tooltip title={GroupTypeEnum.PROTECTED}>
          <Shield size={size} />
        </Tooltip>
      );

    case "PRIVATE":
      return (
        <Tooltip title={GroupTypeEnum.PRIVATE}>
          <EyeSlash size={size} />
        </Tooltip>
      );

    default:
      return (
        <Tooltip title={GroupTypeEnum.PUBLIC}>
          <UsersFour size={size} />
        </Tooltip>
      );
  }
};

export default GroupIcon;
