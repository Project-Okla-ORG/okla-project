import { Outlet } from "react-router-dom"
import Navbar from "./Navbar"
import "../styles/Layout.css"

const Layout = () => {
  return (
    <div className="app-container">
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <p>&copy; {new Date().getFullYear()} Patient Health History Management System</p>
      </footer>
    </div>
  )
}

export default Layout
