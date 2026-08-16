import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import { IconButton, InputAdornment, TextField } from "@mui/material";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  placeholder = "Search...",
}: SearchInputProps) {
  return (
    <TextField
      value={value}
      placeholder={placeholder}
      onChange={(event) => onChange(event.target.value)}
      slotProps={{
        input: {
          startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
          endAdornment: value && onClear ? (
            <InputAdornment position="end">
              <IconButton aria-label="Clear search" edge="end" onClick={onClear} size="small"><CloseIcon fontSize="small" /></IconButton>
            </InputAdornment>
          ) : undefined,
        },
      }}
    />
  );
}
