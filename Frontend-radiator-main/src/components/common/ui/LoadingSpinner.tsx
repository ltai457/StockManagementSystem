import { CircularProgress, Stack, Typography } from "@mui/material";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

const sizes = { sm: 16, md: 24, lg: 40 } as const;

export function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
  return (
    <Stack alignItems="center" direction="row" justifyContent="center" p={2} spacing={1}>
      <CircularProgress aria-label={text || "Loading"} size={sizes[size]} />
      {text && <Typography color="text.secondary" variant="body2">{text}</Typography>}
    </Stack>
  );
}
