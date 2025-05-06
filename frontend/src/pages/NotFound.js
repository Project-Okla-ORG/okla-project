import { Link } from "react-router-dom"
import "../styles/NotFound.css"

const NotFound = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="home-button">
        Go to Dashboard
      </Link>
    </div>
  )
}

export default NotFound
