import type { ElementType, ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";

export interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  icon?: ElementType;
  actions?: ReactNode;
  children?: ReactNode;
}

export function PageHeader({ title, subtitle, icon: Icon, actions, children }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: "column", lg: "row" }}
      alignItems={{ xs: "stretch", lg: "center" }}
      justifyContent="space-between"
      spacing={2}
    >
      <Stack direction="row" alignItems="flex-start" spacing={1.25} minWidth={0}>
        {Icon && (
          <Box color="primary.main" display="flex" pt={0.25}>
            <Icon size={24} />
          </Box>
        )}
        <Box minWidth={0}>
          <Typography component="h1" variant="h2">{title}</Typography>
          {subtitle && <Typography color="text.secondary" mt={0.5}>{subtitle}</Typography>}
        </Box>
      </Stack>
      {actions && (
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
          {actions}
        </Stack>
      )}
      {children}
    </Stack>
  );
}
