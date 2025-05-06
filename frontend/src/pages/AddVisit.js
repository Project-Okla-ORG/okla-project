"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { createVisit } from "../services/visitService"
import VisitForm from "../components/VisitForm"
import "../styles/VisitForm.css"

const AddVisit = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (visitData) => {
    setLoading(true)
    setError("")

    try {
      const newVisit = await createVisit(visitData)
      navigate(`/visits/${newVisit.id}`)
    } catch (err) {
      setError("Failed to create visit. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="visit-form-container">
      <h1>Add New Visit</h1>

      {error && <div className="error-message">{error}</div>}

      <VisitForm onSubmit={handleSubmit} loading={loading} submitButtonText="Add Visit" />
    </div>
  )
}

export default AddVisit
