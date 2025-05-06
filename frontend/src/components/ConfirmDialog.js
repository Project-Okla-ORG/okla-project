"use client"
import "../styles/ConfirmDialog.css"

const ConfirmDialog = ({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel }) => {
  if (!isOpen) return null

  return (
    <div className="confirm-dialog-overlay">
      <div className="confirm-dialog">
        <h3 className="dialog-title">{title}</h3>
        <p className="dialog-message">{message}</p>
        <div className="dialog-actions">
          <button className="cancel-button" onClick={onCancel}>
            {cancelText || "Cancel"}
          </button>
          <button className="confirm-button" onClick={onConfirm}>
            {confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
