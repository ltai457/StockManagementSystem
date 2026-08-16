import { Alert, AlertTitle, Button } from "@mui/material";

interface PageErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export default function PageErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try Again",
}: PageErrorStateProps) {
  return (
    <Alert
      severity="error"
      action={onRetry ? <Button color="inherit" onClick={onRetry}>{retryLabel}</Button> : undefined}
    >
      <AlertTitle>{title}</AlertTitle>
      {message}
    </Alert>
  );
}
