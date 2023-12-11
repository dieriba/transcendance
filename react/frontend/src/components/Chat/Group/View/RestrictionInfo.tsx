import { Button, Stack, TextField } from "@mui/material";
import { RestrictedGroupType } from "../../../../models/groupChat";
import DialogI, { DialogProps } from "../../../Dialog/DialogI";

interface RestrictionInfoProps extends DialogProps {
  restrictionInfo: RestrictedGroupType & { nickname: string };
}

const RestrictionInfo = ({
  open,
  handleClose,
  restrictionInfo,
}: RestrictionInfoProps) => {
  const start = new Date(restrictionInfo.restrictionTimeStart);
  const end = new Date(restrictionInfo.restrictionTimeEnd);
  const localTimeOptions = { hour12: false };

  return (
    <DialogI open={open} handleClose={handleClose}>
      <Stack p={5} spacing={3}>
        <TextField
          label={"BannedBy"}
          value={restrictionInfo.admin.user.nickname}
          disabled
          fullWidth
        />
        <TextField
          label={`Role of ${restrictionInfo.admin.user.nickname}`}
          value={restrictionInfo.admin.role}
          disabled
          fullWidth
        />
        <TextField
          label={"Banned user"}
          value={restrictionInfo.nickname}
          disabled
          fullWidth
        />
        <TextField
          label={"Reason"}
          value={restrictionInfo.reason}
          disabled
          fullWidth
          multiline
          maxRows={4}
        />
        <TextField
          label={"Restriction time start"}
          value={`${start.toLocaleDateString()} at ${start.toLocaleTimeString(
            "fr-FR",
            localTimeOptions
          )}`}
          disabled
          fullWidth
        />
        <TextField
          label={"Restriction time end"}
          value={`${end.toLocaleDateString()} at ${end.toLocaleTimeString(
            "fr-FR",
            localTimeOptions
          )}`}
          disabled
          fullWidth
        />
        <Button
          onClick={() => {
            handleClose();
          }}
          fullWidth
          color="error"
          variant="outlined"
        >
          Close
        </Button>
      </Stack>
    </DialogI>
  );
};

export default RestrictionInfo;
