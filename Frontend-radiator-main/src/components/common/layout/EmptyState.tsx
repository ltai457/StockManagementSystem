import type { ElementType, ReactNode } from "react";
import { Box, Stack, Typography } from "@mui/material";
import { Button } from "../ui/Button";

interface EmptyStateProps {
  icon?: ElementType;
  title: ReactNode;
  description?: ReactNode;
  action?: boolean;
  actionLabel?: ReactNode;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <Stack alignItems="center" py={6} spacing={1.5} textAlign="center">
      {Icon && <Box color="text.disabled" display="flex"><Icon size={64} /></Box>}
      <Typography variant="h4">{title}</Typography>
      {description && <Typography color="text.secondary">{description}</Typography>}
      {action && onAction && <Button onClick={onAction}>{actionLabel}</Button>}
    </Stack>
  );
}
