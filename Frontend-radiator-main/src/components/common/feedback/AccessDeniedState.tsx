import { Box, Stack, Typography } from "@mui/material";
import { Shield } from "lucide-react";

interface AccessDeniedStateProps {
  title?: string;
  message?: string;
}

export default function AccessDeniedState({
  title = "Access Denied",
  message = "You don't have permission to access this section.",
}: AccessDeniedStateProps) {
  return (
    <Stack alignItems="center" py={6} spacing={1.5} textAlign="center">
      <Box color="text.disabled" display="flex"><Shield size={64} /></Box>
      <Typography variant="h4">{title}</Typography>
      <Typography color="text.secondary">{message}</Typography>
    </Stack>
  );
}
