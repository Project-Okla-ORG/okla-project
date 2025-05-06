"use client"

import { useState } from "react"
import { useAuth } from "../contexts/AuthContext"
import "../styles/Profile.css"

const Profile = () => {
  const { currentUser, updateProfile, logout } = useAuth()
  const [formData, setFormData] = useState({
    firstName: currentUser?.firstName || "",
    lastName: currentUser?.lastName || "",
    email: currentUser?.email || "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      await updateProfile(formData)
      setSuccess("Profile updated successfully")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not available"
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <div className="profile-container">
      <h1>Your Profile</h1>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">
            {currentUser?.firstName?.charAt(0)}
            {currentUser?.lastName?.charAt(0)}
          </div>
          <div className="profile-info">
            <h2>
              {currentUser?.firstName} {currentUser?.lastName}
            </h2>
            <p>{currentUser?.email}</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="detail-item">
            <span className="detail-label">Date of Birth:</span>
            <span className="detail-value">{formatDate(currentUser?.dateOfBirth)}</span>
          </div>
          <div className="detail-item">
            <span className="detail-label">Member Since:</span>
            <span className="detail-value">{formatDate(currentUser?.createdAt)}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <h3>Edit Profile</h3>

          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled
            />
            <small>Email cannot be changed</small>
          </div>

          <div className="form-actions">
            <button type="submit" className="update-button" disabled={loading}>
              {loading ? "Updating..." : "Update Profile"}
            </button>
            <button type="button" className="logout-button" onClick={logout}>
              Logout
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Profile
