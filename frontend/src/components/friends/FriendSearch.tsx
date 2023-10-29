import { Card, InputAdornment, OutlinedInput, SvgIcon } from "@mui/material";
import { MagnifyingGlass } from "phosphor-react";

interface FriendSearchProps {
  placeholder: string;
}

const FriendSearch = ({ placeholder }: FriendSearchProps) => {
  return (
    <>
      <Card sx={{ p: 2 }}>
        <OutlinedInput
          defaultValue=""
          fullWidth
          placeholder={placeholder}
          startAdornment={
            <InputAdornment position="start">
              <SvgIcon color="action" fontSize="small">
                <MagnifyingGlass />
              </SvgIcon>
            </InputAdornment>
          }
        />
      </Card>
    </>
  );
};

export default FriendSearch;
