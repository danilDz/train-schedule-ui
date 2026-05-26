import React from "react";
import "./ConfirmModal.scss";

interface ConfirmModalProps {
  isOpen: boolean;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  confirmLabel?: string;
  isDanger?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  message,
  onConfirm,
  onClose,
  confirmLabel = "Confirm",
  isDanger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="confirmOverlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="confirmWindow">
        <p>{message}</p>
        <div className="confirmButtons">
          <button id="cancel" className="confirmBtn confirmBtn--cancel" onClick={onClose}>
            Cancel
          </button>
          <button
            className={`confirmBtn ${isDanger ? "confirmBtn--danger" : "confirmBtn--confirm"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
