"use client";

import { ReactNode, useState } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { Button } from "./Button";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "brand";
  icon?: "trash" | "warning";
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  icon = "trash",
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const IconComponent = icon === "trash" ? Trash2 : AlertTriangle;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth="max-w-sm"
      hideHeader
    >
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={
              variant === "danger"
                ? "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10 text-red-400"
                : "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brand-500/20 bg-brand-500/10 text-brand-300"
            }
          >
            <IconComponent size={20} aria-hidden />
          </div>
          <div className="flex-1 min-w-0 pr-6">
            <h3 className="text-base font-semibold text-white">{title}</h3>
            {description && (
              <div className="mt-1.5 text-xs leading-relaxed text-gray-400">
                {description}
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={variant}
            size="sm"
            onClick={handleConfirm}
            disabled={loading}
            className="px-4"
          >
            {loading ? "Confirming…" : confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
