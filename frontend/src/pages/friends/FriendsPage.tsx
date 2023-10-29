import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import { Container, Stack, IconButton } from "@mui/material";
import { UserPlus } from "phosphor-react";
import CustomerSearch from "../../components/friends/CustomerSearch";
import CustomersTable from "../../components/friends/CustomersTable";
import { useState } from "react";
import FriendRequestForm from "../../components/friends/FriendRequestForm";

const FriendsPage = () => {
  const [openCreate, setOpenCreate] = useState(false);

  return (
    <>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          py: 8,
        }}
      >
        <Container maxWidth="xl">
          <Stack spacing={3}>
            <Stack direction="row" justifyContent="space-between" spacing={4}>
              <Stack spacing={1}>
                <Typography variant="h4">Friends</Typography>
              </Stack>
              <IconButton onClick={() => setOpenCreate(true)}>
                <UserPlus />
              </IconButton>
            </Stack>
            <CustomerSearch />
            <CustomersTable />
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
