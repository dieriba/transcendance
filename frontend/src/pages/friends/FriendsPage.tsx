import Box from "@mui/material/Box";
import { Container, Stack, Tabs, Tab, Button } from "@mui/material";
import { UserPlus } from "phosphor-react";
import FriendsTable from "../../components/friends/FriendsTable";
import { useState } from "react";
import FriendRequestForm from "../../components/friends/FriendRequestForm";
import CustomTabPanel from "../../components/table-panel/CustomTablePanel";
import FriendRequestReceived from "../../components/friends/FriendRequestReceivedTable";
import FriendRequestSentTable from "../../components/friends/FriendRequestSentTable";

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}

const FriendsPage = () => {
  const [openCreate, setOpenCreate] = useState(false);
  const [value, setValue] = useState(1);

  const handleChange = (_event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 4,
          height: "100vh",
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Button
                endIcon={<UserPlus />}
                onClick={() => setOpenCreate(true)}
              >
                Add New Friend
              </Button>
            </Stack>
            <Tabs
              variant="fullWidth"
              value={value}
              onChange={handleChange}
              aria-label="basic tabs example"
            >
              <Tab label="Received friends request" {...a11yProps(0)} />
              <Tab label="Friends" {...a11yProps(1)} />
              <Tab label="Sent friends request" {...a11yProps(2)} />
            </Tabs>
            <CustomTabPanel value={value} index={0}>
              <FriendRequestReceived />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={1}>
              <FriendsTable />
            </CustomTabPanel>
            <CustomTabPanel value={value} index={2}>
              <FriendRequestSentTable />
            </CustomTabPanel>
          </Stack>
        </Container>
      </Box>
      <FriendRequestForm
        open={openCreate}
        handleClose={() => setOpenCreate(false)}
      />
    </>
  );
};
export default FriendsPage;
