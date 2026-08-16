import type { ElementType, ReactNode } from "react";
import {
  Button as MuiButton,
  CircularProgress,
  type ButtonProps as MuiButtonProps,
} from "@mui/material";

export type AppButtonVariant = "primary" | "secondary" | "danger" | "warning" | "outline" | "ghost";
export type AppButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends Omit<MuiButtonProps, "variant" | "size" | "startIcon"> {
  children?: ReactNode;
  variant?: AppButtonVariant;
  size?: AppButtonSize;
  loading?: boolean;
  icon?: ElementType;
}

const variants: Record<AppButtonVariant, Pick<MuiButtonProps, "variant" | "color">> = {
  primary: { variant: "contained", color: "primary" },
  secondary: { variant: "contained", color: "secondary" },
  danger: { variant: "contained", color: "error" },
  warning: { variant: "contained", color: "warning" },
  outline: { variant: "outlined", color: "primary" },
  ghost: { variant: "text", color: "inherit" },
};

const sizes: Record<AppButtonSize, MuiButtonProps["size"]> = {
  sm: "small",
  md: "medium",
  lg: "large",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  disabled = false,
  loading = false,
  icon: Icon,
  ...props
}: ButtonProps) {
  const appearance = variants[variant];

  return (
    <MuiButton
      {...props}
      {...appearance}
      size={sizes[size]}
      disabled={disabled || loading}
      startIcon={
        loading ? <CircularProgress color="inherit" size={16} /> : Icon ? <Icon size={16} /> : undefined
      }
      sx={{ minWidth: children ? undefined : 44, ...props.sx }}
    >
      {children}
    </MuiButton>
  );
}
