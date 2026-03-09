import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ open, title, message, confirmLabel = 'Delete', onConfirm, onCancel }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-foreground/30" onClick={onCancel} />
      <div className="relative bg-card rounded-2xl shadow-2xl w-full max-w-sm animate-fade-slide-up overflow-hidden">
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-danger/10 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-6 h-6 text-danger" />
          </div>
          <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel} className="flex-1 py-2.5 bg-card border border-border text-muted-foreground rounded-lg text-sm font-medium hover:bg-muted transition-colors cursor-pointer">
            Cancel
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 bg-danger text-primary-foreground rounded-lg text-sm font-semibold btn-interact cursor-pointer">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
