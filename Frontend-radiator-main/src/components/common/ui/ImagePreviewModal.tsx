import CloseIcon from "@mui/icons-material/Close";
import { Box, Dialog, IconButton } from "@mui/material";

interface ImagePreviewModalProps {
  isOpen: boolean;
  src?: string | null;
  alt?: string;
  onClose: () => void;
}

export default function ImagePreviewModal({ isOpen, src, alt, onClose }: ImagePreviewModalProps) {
  return (
    <Dialog
      open={isOpen && Boolean(src)}
      onClose={onClose}
      maxWidth={false}
      slotProps={{
        backdrop: { sx: { bgcolor: "rgba(15, 23, 42, 0.82)", backdropFilter: "blur(4px)" } },
        paper: { sx: { bgcolor: "transparent", boxShadow: "none", m: 2, maxHeight: "90vh", maxWidth: "95vw", overflow: "visible" } },
      }}
    >
      <IconButton aria-label="Close image preview" onClick={onClose} sx={{ bgcolor: "rgba(0,0,0,.55)", color: "white", position: "absolute", right: 0, top: -52, "&:hover": { bgcolor: "rgba(0,0,0,.75)" } }}>
        <CloseIcon />
      </IconButton>
      {src && <Box component="img" src={src} alt={alt || "Preview"} sx={{ borderRadius: 2, maxHeight: "85vh", maxWidth: "100%", objectFit: "contain" }} />}
    </Dialog>
  );
}
