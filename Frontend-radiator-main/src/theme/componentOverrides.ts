import type { Components, Theme } from "@mui/material/styles";
import { colors } from "./colors";

export const createComponentOverrides = (theme: Theme): Components<Theme> => ({
  MuiButton: {
    defaultProps: {
      disableElevation: true,
      size: "medium",
    },
    styleOverrides: {
      root: {
        minHeight: 44,
        borderRadius: 10,
        paddingInline: theme.spacing(2),
        textTransform: "none",
      },
    },
  },
  MuiIconButton: {
    styleOverrides: {
      root: {
        minWidth: 44,
        minHeight: 44,
        borderRadius: 10,
      },
    },
  },
  MuiCard: {
    defaultProps: {
      elevation: 0,
    },
    styleOverrides: {
      root: {
        border: `1px solid ${colors.neutral[200]}`,
        borderRadius: 16,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 16,
        backgroundImage: "none",
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      fullWidth: true,
      size: "small",
      variant: "outlined",
    },
  },
  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        minHeight: 44,
        borderRadius: 10,
      },
    },
  },
  MuiTableContainer: {
    styleOverrides: {
      root: {
        border: `1px solid ${colors.neutral[200]}`,
        borderRadius: 14,
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      head: {
        backgroundColor: colors.neutral[50],
        color: colors.neutral[700],
        fontWeight: 700,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 12,
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        fontWeight: 600,
      },
    },
  },
  MuiTooltip: {
    defaultProps: {
      arrow: true,
    },
  },
});
