import { DialogContent, Tab, Tabs } from "@mui/material";
import { useState } from "react";
import ChangePassword from "./ChangePassword";
import { a11yProps } from "../../../utils/allyProps";
import DialogI from "../../Dialog/DialogI";
import CustomTabPanel from "../../table-panel/CustomTablePanel";
import TwoFa from "./TwoFa";

interface SecurityProps {
  open: boolean;
  handleClose: () => void;
}

const Security = ({ open, handleClose }: SecurityProps) => {
  const [value, setValue] = useState(0);
  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <DialogI maxWidth="sm" open={open} handleClose={handleClose}>
        <DialogContent>
          <Tabs
            variant="fullWidth"
            value={value}
            onChange={handleChange}
            aria-label="basic tabs example"
          >
            <Tab label="Activate 2fa" {...a11yProps(0)} />
            <Tab label="Change password" {...a11yProps(1)} />
          </Tabs>
          <CustomTabPanel value={value} index={0}>
            <TwoFa />
          </CustomTabPanel>
          <CustomTabPanel value={value} index={1}>
            <ChangePassword />
          </CustomTabPanel>
        </DialogContent>
      </DialogI>
    </>
  );
};

export default Security;
