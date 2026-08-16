import { Avatar, Divider, Stack, Typography } from "@mui/material";
import { AlertTriangle } from "lucide-react";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  variant?: "danger" | "warning";
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm Delete",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  variant = "danger",
}: ConfirmDeleteModalProps) {
  const handleConfirm = async () => {
    if (!loading) await onConfirm();
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={title} size="sm">
      <Stack spacing={2.5}>
        <Stack alignItems="flex-start" direction="row" spacing={1.5}>
          <Avatar sx={{ bgcolor: `${variant === "danger" ? "error" : "warning"}.light`, color: `${variant === "danger" ? "error" : "warning"}.dark` }}>
            <AlertTriangle size={20} />
          </Avatar>
          <Typography color="text.secondary">{description}</Typography>
        </Stack>
        <Divider />
        <Stack direction="row" justifyContent="flex-end" spacing={1}>
          <Button variant="outline" onClick={handleClose} disabled={loading}>{cancelText}</Button>
          <Button variant={variant} onClick={handleConfirm} loading={loading}>
            {loading ? "Deleting..." : confirmText}
          </Button>
        </Stack>
      </Stack>
    </Modal>
  );
}
