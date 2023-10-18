import { Box, Menu, MenuItem } from "@mui/material";
import { DotsThreeVertical } from "phosphor-react";
import React from "react";
import { Message_options } from "../../../data/data";

const ChatMessageOptions = () => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
      <Box
        id="demo-positioned-button"
        aria-controls={open ? "demo-positioned-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
        onClick={handleClick}
        sx={{ cursor: "pointer" }}
      >
        <DotsThreeVertical size={20} />
      </Box>
      <Menu
        id="demo-positioned-menu"
        aria-labelledby="demo-positioned-button"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {Message_options.map((item, index) => (
          <MenuItem sx={{ height: "2rem" }} onClick={handleClose} key={index}>
            {item.title}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default ChatMessageOptions;
