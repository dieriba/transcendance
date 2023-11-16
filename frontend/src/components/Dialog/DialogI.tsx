import { Breakpoint, Dialog, Slide, SxProps, Theme } from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import React, { ReactNode } from "react";

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export interface DialogProps {
  open: boolean;
  handleClose: () => void;
}

interface Children {
  children: ReactNode;
  sx?: SxProps<Theme> | undefined;
  maxWidth?: Breakpoint | undefined;
}

interface DialogIProps extends DialogProps, Children {}

const DialogI = ({
  open,
  handleClose,
  children,
  sx,
  maxWidth,
}: DialogIProps) => {

  return (
    <Dialog
      open={open}
      TransitionComponent={Transition}
      keepMounted
      onClose={handleClose}
      aria-describedby="alert-dialog-slide-description"
      fullWidth
      maxWidth={maxWidth}
      sx={sx}
    >
      {children}
    </Dialog>
  );
};

export default DialogI;
