import express from "express"
import { authenticateToken } from "../middleware/auth.js"

const router = express.Router()

// Get all visits for a user
router.get("/", authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db

    const result = await db.query(
      `SELECT v.*, 
        (SELECT COUNT(*) FROM documents d WHERE d.visit_id = v.id) as document_count
       FROM visits v 
       WHERE v.user_id = $1 
       ORDER BY v.visit_date DESC`,
      [req.user.userId],
    )

    res.json(result.rows)
  } catch (error) {
    console.error("Get visits error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get a specific visit
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db

    const result = await db.query("SELECT * FROM visits WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.user.userId,
    ])

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Visit not found" })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error("Get visit error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new visit
router.post("/", authenticateToken, async (req, res) => {
  const { visitDate, hospitalName, doctorName, reasonForVisit, prescriptionNotes } = req.body

  try {
    const db = req.app.locals.db

    const result = await db.query(
      `INSERT INTO visits 
        (user_id, visit_date, hospital_name, doctor_name, reason_for_visit, prescription_notes, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, NOW()) 
       RETURNING *`,
      [req.user.userId, visitDate, hospitalName, doctorName, reasonForVisit, prescriptionNotes],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error("Create visit error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update a visit
router.put("/:id", authenticateToken, async (req, res) => {
  const { visitDate, hospitalName, doctorName, reasonForVisit, prescriptionNotes } = req.body

  try {
    const db = req.app.locals.db

    // Check if visit exists and belongs to user
    const checkResult = await db.query("SELECT * FROM visits WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.user.userId,
    ])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Visit not found" })
    }

    const result = await db.query(
      `UPDATE visits 
       SET visit_date = $1, 
           hospital_name = $2, 
           doctor_name = $3, 
           reason_for_visit = $4, 
           prescription_notes = $5, 
           updated_at = NOW() 
       WHERE id = $6 AND user_id = $7 
       RETURNING *`,
      [visitDate, hospitalName, doctorName, reasonForVisit, prescriptionNotes, req.params.id, req.user.userId],
    )

    res.json(result.rows[0])
  } catch (error) {
    console.error("Update visit error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a visit
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db

    // Check if visit exists and belongs to user
    const checkResult = await db.query("SELECT * FROM visits WHERE id = $1 AND user_id = $2", [
      req.params.id,
      req.user.userId,
    ])

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: "Visit not found" })
    }

    // Delete associated documents first (to avoid foreign key constraints)
    await db.query("DELETE FROM documents WHERE visit_id = $1", [req.params.id])

    // Delete the visit
    await db.query("DELETE FROM visits WHERE id = $1 AND user_id = $2", [req.params.id, req.user.userId])

    res.json({ message: "Visit deleted successfully" })
  } catch (error) {
    console.error("Delete visit error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
