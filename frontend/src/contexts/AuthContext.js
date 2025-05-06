"use client"

import { createContext, useState, useContext, useEffect } from "react"
import api from "../services/api"

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem("token"))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Set token in localStorage and axios headers
  const setAuthToken = (token) => {
    if (token) {
      localStorage.setItem("token", token)
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`
    } else {
      localStorage.removeItem("token")
      delete api.defaults.headers.common["Authorization"]
    }
    setToken(token)
  }

  // Register user
  const register = async (userData) => {
    try {
      setError(null)
      const response = await api.post("/auth/register", userData)
      setCurrentUser(response.data.user)
      setAuthToken(response.data.token)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
      throw err
    }
  }

  // Login user
  const login = async (credentials) => {
    try {
      setError(null)
      const response = await api.post("/auth/login", credentials)
      setCurrentUser(response.data.user)
      setAuthToken(response.data.token)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || "Login failed")
      throw err
    }
  }

  // Logout user
  const logout = () => {
    setCurrentUser(null)
    setAuthToken(null)
  }

  // Update user profile
  const updateProfile = async (userData) => {
    try {
      setError(null)
      const response = await api.put("/auth/me", userData)
      setCurrentUser(response.data)
      return response.data
    } catch (err) {
      setError(err.response?.data?.message || "Profile update failed")
      throw err
    }
  }

  // Load user data if token exists
  useEffect(() => {
    const loadUser = async () => {
      if (token) {
        try {
          api.defaults.headers.common["Authorization"] = `Bearer ${token}`
          const response = await api.get("/auth/me")
          setCurrentUser(response.data)
        } catch (err) {
          console.error("Error loading user:", err)
          setCurrentUser(null)
          setAuthToken(null)
        }
      }
      setLoading(false)
    }

    loadUser()
  }, [token])

  const value = {
    currentUser,
    token,
    loading,
    error,
    isAuthenticated: !!token,
    register,
    login,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
