"use client"

import { useState } from "react"
import ConfirmDialog from "./ConfirmDialog"
import "../styles/DocumentList.css"

const DocumentList = ({ documents, onDelete }) => {
  const [documentToDelete, setDocumentToDelete] = useState(null)

  const handleDeleteClick = (document) => {
    setDocumentToDelete(document)
  }

  const confirmDelete = () => {
    if (documentToDelete) {
      onDelete(documentToDelete.id)
      setDocumentToDelete(null)
    }
  }

  const cancelDelete = () => {
    setDocumentToDelete(null)
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  const getFileIcon = (fileType) => {
    if (fileType.includes("pdf")) return "📄"
    if (fileType.includes("image")) return "🖼️"
    if (fileType.includes("word")) return "📝"
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "📊"
    return "📎"
  }

  if (documents.length === 0) {
    return (
      <div className="no-documents">
        <p>No documents uploaded for this visit.</p>
      </div>
    )
  }

  return (
    <div className="document-list">
      {documents.map((document) => (
        <div key={document.id} className="document-item">
          <div className="document-icon">{getFileIcon(document.file_type)}</div>
          <div className="document-info">
            <a href={document.url} target="_blank" rel="noopener noreferrer" className="document-name">
              {document.file_name}
            </a>
            <div className="document-meta">
              <span className="document-size">{formatFileSize(document.file_size)}</span>
              <span className="document-type">{document.file_type.split("/")[1]}</span>
            </div>
          </div>
          <button
            className="delete-document-button"
            onClick={() => handleDeleteClick(document)}
            aria-label="Delete document"
          >
            🗑️
          </button>
        </div>
      ))}

      <ConfirmDialog
        isOpen={!!documentToDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${documentToDelete?.file_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  )
}

export default DocumentList
