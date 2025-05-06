"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { getVisits } from "../services/visitService"
import { useAuth } from "../contexts/AuthContext"
import VisitCard from "../components/VisitCard"
import "../styles/Dashboard.css"

const Dashboard = () => {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const { currentUser } = useAuth()

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const data = await getVisits()
        setVisits(data)
      } catch (err) {
        setError("Failed to fetch visits. Please try again later.")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchVisits()
  }, [])

  if (loading) {
    return <div className="loading">Loading visits...</div>
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Your Health History</h1>
        <Link to="/visits/add" className="add-visit-button">
          Add New Visit
        </Link>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="welcome-message">
        <h2>Welcome, {currentUser?.firstName}!</h2>
        <p>Here you can track and manage your hospital visits and medical records.</p>
      </div>

      {visits.length === 0 ? (
        <div className="no-visits">
          <p>You haven't recorded any hospital visits yet.</p>
          <p>Click the "Add New Visit" button to start tracking your health history.</p>
        </div>
      ) : (
        <div className="visits-grid">
          {visits.map((visit) => (
            <VisitCard key={visit.id} visit={visit} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
