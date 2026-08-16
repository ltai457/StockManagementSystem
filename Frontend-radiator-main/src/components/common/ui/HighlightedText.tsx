import { Box } from "@mui/material";

interface HighlightedTextProps {
  text?: string | number | null;
  query?: string;
}

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default function HighlightedText({ text, query }: HighlightedTextProps) {
  const content = String(text ?? "");
  const searchTerm = query?.trim();

  if (!searchTerm) return <Box component="span">{content}</Box>;

  const parts = content.split(new RegExp(`(${escapeRegExp(searchTerm)})`, "ig"));

  return (
    <Box component="span">
      {parts.map((part, index) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <Box
            component="mark"
            key={`${part}-${index}`}
            sx={{ bgcolor: "warning.light", borderRadius: 0.5, color: "inherit", px: 0.25 }}
          >
            {part}
          </Box>
        ) : part
      )}
    </Box>
  );
}
