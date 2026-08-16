import { createTheme, responsiveFontSizes } from "@mui/material/styles";
import { colors } from "./colors";
import { createComponentOverrides } from "./componentOverrides";
import { typography } from "./typography";

const baseTheme = createTheme({
  palette: {
    mode: "light",
    primary: {
      light: colors.brand[500],
      main: colors.brand[600],
      dark: colors.brand[700],
    },
    secondary: {
      light: colors.neutral[300],
      main: colors.neutral[700],
      dark: colors.neutral[900],
    },
    success: colors.success,
    warning: colors.warning,
    error: colors.error,
    background: {
      default: colors.neutral[50],
      paper: "#ffffff",
    },
    text: {
      primary: colors.neutral[900],
      secondary: colors.neutral[500],
    },
    divider: colors.neutral[200],
  },
  shape: {
    borderRadius: 10,
  },
  spacing: 8,
  typography,
});

export const appTheme = responsiveFontSizes(
  createTheme(baseTheme, {
    components: createComponentOverrides(baseTheme),
  })
);

export { colors } from "./colors";
