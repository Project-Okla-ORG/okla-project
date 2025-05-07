import axios from "axios"

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://patient-health-backend:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
})

// Add token to requests if it exists in localStorage
const token = localStorage.getItem("token")
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`
}

// Add response interceptor for handling errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token")
      delete api.defaults.headers.common["Authorization"]
      window.location.href = "/login"
    }
    return Promise.reject(error)
  },
)

export default api
