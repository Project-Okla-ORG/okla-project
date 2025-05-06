import { Link } from "react-router-dom"
import "../styles/VisitCard.css"

const VisitCard = ({ visit }) => {
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  return (
    <Link to={`/visits/${visit.id}`} className="visit-card">
      <div className="visit-card-header">
        <h3>{visit.hospital_name}</h3>
        <span className="visit-date">{formatDate(visit.visit_date)}</span>
      </div>
      <div className="visit-card-content">
        <p className="doctor-name">
          <strong>Doctor:</strong> {visit.doctor_name}
        </p>
        <p className="visit-reason">
          <strong>Reason:</strong>{" "}
          {visit.reason_for_visit.length > 60
            ? `${visit.reason_for_visit.substring(0, 60)}...`
            : visit.reason_for_visit}
        </p>
        <div className="visit-documents">
          <span className="document-count">
            {visit.document_count || 0} Document{visit.document_count !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
    </Link>
  )
}

export default VisitCard
