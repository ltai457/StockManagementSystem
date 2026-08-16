import { Box } from "@mui/material";
import { LoadingSpinner } from "../ui/LoadingSpinner";

interface PageLoadingStateProps {
  text?: string;
}

export default function PageLoadingState({ text = "Loading..." }: PageLoadingStateProps) {
  return (
    <Box alignItems="center" display="flex" justifyContent="center" minHeight="100vh">
      <LoadingSpinner size="lg" text={text} />
    </Box>
  );
}
