"use client"

import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import "../styles/Navbar.css"

const Navbar = () => {
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">🏥</span>
          <span className="logo-text">Health History</span>
        </Link>

        <div className="mobile-menu-button" onClick={toggleMobileMenu}>
          <span className="menu-icon">☰</span>
        </div>

        <ul className={`navbar-menu ${mobileMenuOpen ? "active" : ""}`}>
          <li className="navbar-item">
            <Link to="/" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Dashboard
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/visits/add" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Add Visit
            </Link>
          </li>
          <li className="navbar-item">
            <Link to="/profile" className="navbar-link" onClick={() => setMobileMenuOpen(false)}>
              Profile
            </Link>
          </li>
          <li className="navbar-item">
            <button className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>

        <div className="navbar-user">
          <Link to="/profile" className="user-avatar">
            {currentUser?.firstName?.charAt(0)}
            {currentUser?.lastName?.charAt(0)}
          </Link>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
