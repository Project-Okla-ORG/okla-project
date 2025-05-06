import express from "express"
import multer from "multer"
import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { s3Client } from "../index.js"
import { authenticateToken } from "../middleware/auth.js"
import crypto from "crypto"

const router = express.Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
})

// Get all documents for a visit
router.get("/visit/:visitId", authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db

    // Check if visit belongs to user
    const visitCheck = await db.query("SELECT * FROM visits WHERE id = $1 AND user_id = $2", [
      req.params.visitId,
      req.user.userId,
    ])

    if (visitCheck.rows.length === 0) {
      return res.status(404).json({ message: "Visit not found" })
    }

    const result = await db.query("SELECT * FROM documents WHERE visit_id = $1 ORDER BY created_at DESC", [
      req.params.visitId,
    ])

    // Generate presigned URLs for each document
    const documentsWithUrls = await Promise.all(
      result.rows.map(async (doc) => {
        const command = new GetObjectCommand({
          Bucket: process.env.S3_BUCKET_NAME,
          Key: doc.s3_key,
        })

        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 })

        return {
          ...doc,
          url,
        }
      }),
    )

    res.json(documentsWithUrls)
  } catch (error) {
    console.error("Get documents error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Upload a document
router.post("/upload/:visitId", authenticateToken, upload.single("file"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" })
  }

  try {
    const db = req.app.locals.db

    // Check if visit belongs to user
    const visitCheck = await db.query("SELECT * FROM visits WHERE id = $1 AND user_id = $2", [
      req.params.visitId,
      req.user.userId,
    ])

    if (visitCheck.rows.length === 0) {
      return res.status(404).json({ message: "Visit not found" })
    }

    // Generate unique filename
    const fileExtension = req.file.originalname.split(".").pop()
    const randomName = crypto.randomBytes(16).toString("hex")
    const key = `documents/${req.user.userId}/${req.params.visitId}/${randomName}.${fileExtension}`

    // Upload file to S3
    const uploadParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
    }

    await s3Client.send(new PutObjectCommand(uploadParams))

    // Save document metadata to database
    const result = await db.query(
      `INSERT INTO documents 
        (visit_id, file_name, file_type, s3_key, file_size, created_at) 
       VALUES ($1, $2, $3, $4, $5, NOW()) 
       RETURNING *`,
      [req.params.visitId, req.file.originalname, req.file.mimetype, key, req.file.size],
    )

    // Generate presigned URL for the uploaded document
    const getCommand = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    })

    const url = await getSignedUrl(s3Client, getCommand, { expiresIn: 3600 })

    res.status(201).json({
      ...result.rows[0],
      url,
    })
  } catch (error) {
    console.error("Upload document error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a document
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const db = req.app.locals.db

    // Get document and check if it belongs to user's visit
    const documentCheck = await db.query(
      `SELECT d.* FROM documents d
       JOIN visits v ON d.visit_id = v.id
       WHERE d.id = $1 AND v.user_id = $2`,
      [req.params.id, req.user.userId],
    )

    if (documentCheck.rows.length === 0) {
      return res.status(404).json({ message: "Document not found" })
    }

    const document = documentCheck.rows[0]

    // Delete from S3
    const deleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: document.s3_key,
    }

    await s3Client.send(new DeleteObjectCommand(deleteParams))

    // Delete from database
    await db.query("DELETE FROM documents WHERE id = $1", [req.params.id])

    res.json({ message: "Document deleted successfully" })
  } catch (error) {
    console.error("Delete document error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

export default router
