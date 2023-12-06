import { Button, SxProps, Theme } from "@mui/material";
import { DialogProps } from "../Dialog/DialogI";

interface ButtonDialogOutlinedProps extends Partial<DialogProps> {
  sx?: SxProps<Theme> | undefined;
  buttonName: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  handleOpen: () => void;
}

const ButtonDialogOutlined = ({
  sx,
  buttonName,
  children,
  open,
  handleOpen,
  icon,
}: ButtonDialogOutlinedProps) => {
  return (
    <>
      <Button
        sx={{ ...sx, textTransform: "capitalize" }}
        onClick={handleOpen}
        fullWidth
        variant="outlined"
        startIcon={icon && icon}
      >
        {`${buttonName}`}
      </Button>
      {open && <>{children}</>}
    </>
  );
};

export default ButtonDialogOutlined;
