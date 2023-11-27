import { DialogContent, Tab, Tabs } from "@mui/material";

import { useTheme } from "@mui/material/styles";
import DialogI from "../../../../Dialog/DialogI";
import { a11yProps } from "../../../../../utils/allyProps";
import { useState } from "react";
import CustomTabPanel from "../../../../table-panel/CustomTablePanel";
import AddUser from "./AddUser";
import InviteUser from "./InviteUser";
import { useAppSelector } from "../../../../../redux/hooks";
import { RootState } from "../../../../../redux/store";
import { ChatroomGroupType } from "../../../../../models/groupChat";
import InvitedUser from "./InvitedUser";

interface AddOrInviteProps {
  open: boolean;
  handleClose: () => void;
}

const AddOrInvite = ({ open, handleClose }: AddOrInviteProps) => {
  const theme = useTheme();
  const [value, setValue] = useState(0);
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };
  const { type } = useAppSelector(
    (state: RootState) => state.groups.currentChatroom as ChatroomGroupType
  );

  return (
    <>
      <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
        <DialogContent sx={{ backgroundColor: theme.palette.background.paper }}>
          {type !== "PRIVATE" ? (
            <>
              <Tabs
                variant="fullWidth"
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                <Tab label="Add User" {...a11yProps(0)} />
                <Tab label="Invite User" {...a11yProps(1)} />
                <Tab label="Invited User" {...a11yProps(2)} />
              </Tabs>
              <CustomTabPanel value={value} index={0}>
                <AddUser />
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <InviteUser />
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <InvitedUser />
              </CustomTabPanel>
            </>
          ) : (
            <>
              <Tabs
                variant="fullWidth"
                value={value}
                onChange={handleChange}
                aria-label="basic tabs example"
              >
                <Tab label="Invite User" {...a11yProps(0)} />
                <Tab label="Invited User" {...a11yProps(1)} />
              </Tabs>
              <CustomTabPanel value={value} index={0}>
                <InviteUser />
              </CustomTabPanel>
              <CustomTabPanel value={value} index={1}>
                <InvitedUser />
              </CustomTabPanel>
            </>
          )}
        </DialogContent>
      </DialogI>
    </>
  );
};

export default AddOrInvite;
