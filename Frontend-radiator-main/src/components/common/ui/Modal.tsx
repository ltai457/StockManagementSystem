import type { ReactNode } from "react";
import CloseIcon from "@mui/icons-material/Close";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  type DialogProps,
} from "@mui/material";

export type AppModalSize = "sm" | "md" | "lg" | "xl";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  size?: AppModalSize;
  maxWidth?: DialogProps["maxWidth"];
  showCloseButton?: boolean;
}

const sizes: Record<AppModalSize, NonNullable<DialogProps["maxWidth"]>> = {
  sm: "xs",
  md: "sm",
  lg: "md",
  xl: "lg",
};

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  maxWidth,
  showCloseButton = true,
}: ModalProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth={maxWidth ?? sizes[size]}>
      {(title || showCloseButton) && (
        <DialogTitle sx={{ pr: showCloseButton ? 7 : 3 }}>
          {title}
          {showCloseButton && (
            <IconButton
              aria-label="Close dialog"
              onClick={onClose}
              sx={{ position: "absolute", right: 8, top: 8 }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </DialogTitle>
      )}
      <DialogContent dividers={Boolean(title)}>{children}</DialogContent>
    </Dialog>
  );
}
