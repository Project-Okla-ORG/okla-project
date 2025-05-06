"use client"

import { useState } from "react"
import { Link } from "react-router-dom"
import "../styles/VisitForm.css"

const VisitForm = ({ initialData = {}, onSubmit, loading, submitButtonText }) => {
  const [formData, setFormData] = useState({
    visitDate: initialData.visitDate || "",
    hospitalName: initialData.hospitalName || "",
    doctorName: initialData.doctorName || "",
    reasonForVisit: initialData.reasonForVisit || "",
    prescriptionNotes: initialData.prescriptionNotes || "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      visitDate: formData.visitDate,
      hospitalName: formData.hospitalName,
      doctorName: formData.doctorName,
      reasonForVisit: formData.reasonForVisit,
      prescriptionNotes: formData.prescriptionNotes,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="visit-form">
      <div className="form-group">
        <label htmlFor="visitDate">Visit Date</label>
        <input
          type="date"
          id="visitDate"
          name="visitDate"
          value={formData.visitDate}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="hospitalName">Hospital Name</label>
        <input
          type="text"
          id="hospitalName"
          name="hospitalName"
          value={formData.hospitalName}
          onChange={handleChange}
          placeholder="Enter hospital name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="doctorName">Doctor Name</label>
        <input
          type="text"
          id="doctorName"
          name="doctorName"
          value={formData.doctorName}
          onChange={handleChange}
          placeholder="Enter doctor name"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="reasonForVisit">Reason for Visit</label>
        <textarea
          id="reasonForVisit"
          name="reasonForVisit"
          value={formData.reasonForVisit}
          onChange={handleChange}
          placeholder="Describe the reason for your visit"
          rows="4"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="prescriptionNotes">Prescription Notes</label>
        <textarea
          id="prescriptionNotes"
          name="prescriptionNotes"
          value={formData.prescriptionNotes}
          onChange={handleChange}
          placeholder="Enter any prescription details or notes (optional)"
          rows="4"
        />
      </div>

      <div className="form-actions">
        <Link to="/" className="cancel-button">
          Cancel
        </Link>
        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? "Saving..." : submitButtonText || "Save"}
        </button>
      </div>
    </form>
  )
}

export default VisitForm
