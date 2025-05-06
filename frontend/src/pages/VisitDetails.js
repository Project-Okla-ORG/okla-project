"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { getVisitById, deleteVisit } from "../services/visitService"
import { getDocumentsByVisitId, uploadDocument, deleteDocument } from "../services/documentService"
import DocumentList from "../components/DocumentList"
import ConfirmDialog from "../components/ConfirmDialog"
import "../styles/VisitDetails.css"

const VisitDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [visit, setVisit] = useState(null)
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [uploading, setUploading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  useEffect(() => {
    const fetchVisitAndDocuments = async () => {
      try {
        const visitData = await getVisitById(id)
        setVisit(visitData)

        const documentsData = await getDocumentsByVisitId(id)
        setDocuments(documentsData)
      } catch (err) {
        setError("Failed to fetch visit details. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchVisitAndDocuments()
  }, [id])

  const handleFileUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const uploadedDocument = await uploadDocument(id, file)
      setDocuments((prevDocuments) => [...prevDocuments, uploadedDocument])
    } catch (err) {
      setError("Failed to upload document. Please try again.")
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (documentId) => {
    try {
      await deleteDocument(documentId)
      setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc.id !== documentId))
    } catch (err) {
      setError("Failed to delete document. Please try again.")
      console.error(err)
    }
  }

  const handleDeleteVisit = async () => {
    try {
      await deleteVisit(id)
      navigate("/")
    } catch (err) {
      setError("Failed to delete visit. Please try again.")
      console.error(err)
    }
  }

  if (loading) {
    return <div className="loading">Loading visit details...</div>
  }

  if (!visit) {
    return <div className="error-message">Visit not found</div>
  }

  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="visit-details-container">
      {error && <div className="error-message">{error}</div>}

      <div className="visit-details-header">
        <h1>Visit Details</h1>
        <div className="visit-actions">
          <Link to={`/visits/${id}/edit`} className="edit-button">
            Edit Visit
          </Link>
          <button className="delete-button" onClick={() => setShowDeleteDialog(true)}>
            Delete Visit
          </button>
        </div>
      </div>

      <div className="visit-info-card">
        <div className="visit-info-header">
          <h2>{visit.hospital_name}</h2>
          <span className="visit-date">{formatDate(visit.visit_date)}</span>
        </div>

        <div className="visit-info-content">
          <div className="info-group">
            <label>Doctor:</label>
            <p>{visit.doctor_name}</p>
          </div>

          <div className="info-group">
            <label>Reason for Visit:</label>
            <p>{visit.reason_for_visit}</p>
          </div>

          <div className="info-group">
            <label>Prescription Notes:</label>
            <p>{visit.prescription_notes || "No prescription notes"}</p>
          </div>
        </div>
      </div>

      <div className="documents-section">
        <div className="documents-header">
          <h2>Documents</h2>
          <div className="upload-container">
            <label htmlFor="file-upload" className="upload-button">
              {uploading ? "Uploading..." : "Upload Document"}
            </label>
            <input
              id="file-upload"
              type="file"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ display: "none" }}
            />
          </div>
        </div>

        <DocumentList documents={documents} onDelete={handleDeleteDocument} />
      </div>

      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Delete Visit"
        message="Are you sure you want to delete this visit? This action cannot be undone and all associated documents will be deleted."
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteVisit}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </div>
  )
}

export default VisitDetails
