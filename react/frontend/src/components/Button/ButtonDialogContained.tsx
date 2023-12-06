import { Button, SxProps, Theme } from "@mui/material";
import { DialogProps } from "../Dialog/DialogI";

interface ButtonDialogContainedProps extends Partial<DialogProps> {
  sx?: SxProps<Theme> | undefined;
  buttonName: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  handleOpen: () => void;
}

const ButtonDialogContained = ({
  sx,
  buttonName,
  children,
  open,
  handleOpen,
  icon,
}: ButtonDialogContainedProps) => {
  return (
    <>
      <Button
        sx={{ ...sx, textTransform: "capitalize" }}
        onClick={handleOpen}
        fullWidth
        color="inherit"
        variant="contained"
        startIcon={icon && icon}
      >
        {`${buttonName}`}
      </Button>
      {open && <>{children}</>}
    </>
  );
};

export default ButtonDialogContained;
