import { Card, InputAdornment, OutlinedInput, SvgIcon } from "@mui/material";
import { MagnifyingGlass } from "phosphor-react";

const CustomerSearch = () => {
  return (
    <>
      <Card sx={{ p: 2 }}>
        <OutlinedInput
          defaultValue=""
          fullWidth
          placeholder="Search Friend"
          startAdornment={
            <InputAdornment position="start">
              <SvgIcon color="action" fontSize="small">
                <MagnifyingGlass />
              </SvgIcon>
            </InputAdornment>
          }
          sx={{ maxWidth: 500 }}
        />
      </Card>
    </>
  );
};

export default CustomerSearch;
