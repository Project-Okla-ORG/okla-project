"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getVisitById, updateVisit } from "../services/visitService"
import VisitForm from "../components/VisitForm"
import "../styles/VisitForm.css"

const EditVisit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [visit, setVisit] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        const visitData = await getVisitById(id)
        setVisit(visitData)
      } catch (err) {
        setError("Failed to fetch visit details. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchVisit()
  }, [id])

  const handleSubmit = async (visitData) => {
    setSubmitting(true)
    setError("")

    try {
      await updateVisit(id, visitData)
      navigate(`/visits/${id}`)
    } catch (err) {
      setError("Failed to update visit. Please try again.")
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="loading">Loading visit details...</div>
  }

  if (!visit) {
    return <div className="error-message">Visit not found</div>
  }

  return (
    <div className="visit-form-container">
      <h1>Edit Visit</h1>

      {error && <div className="error-message">{error}</div>}

      <VisitForm
        initialData={{
          visitDate: visit.visit_date,
          hospitalName: visit.hospital_name,
          doctorName: visit.doctor_name,
          reasonForVisit: visit.reason_for_visit,
          prescriptionNotes: visit.prescription_notes,
        }}
        onSubmit={handleSubmit}
        loading={submitting}
        submitButtonText="Update Visit"
      />
    </div>
  )
}

export default EditVisit
