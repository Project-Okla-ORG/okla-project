import express from "express"
import cors from "cors"
import helmet from "helmet"
import morgan from "morgan"
import { config } from "dotenv"
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager"
import { S3Client } from "@aws-sdk/client-s3"
import { Pool } from "pg"
import authRoutes from "./routes/auth.js"
import visitRoutes from "./routes/visits.js"
import documentRoutes from "./routes/documents.js"

// Load environment variables
config()

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(cors())
app.use(helmet())
app.use(morgan("dev"))
app.use(express.json())

// Initialize AWS clients
const secretsManager = new SecretsManagerClient({
  region: process.env.AWS_REGION || "us-east-1",
})

export const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-1",
})

// Function to get secrets from AWS Secrets Manager
async function getSecrets(secretName) {
  try {
    const command = new GetSecretValueCommand({
      SecretId: secretName,
    })
    const response = await secretsManager.send(command)
    const secrets = JSON.parse(response.SecretString)
    console.log("✅ Retrieved secrets:", Object.keys(secrets))
    return secrets
  } catch (error) {
    console.error("❌ Error retrieving secrets:", error)
    throw error
  }
}

// Initialize database connection
let dbPool

async function initializeApp() {
  try {
    // Get database credentials from AWS Secrets Manager
    const dbSecrets = await getSecrets(process.env.DB_SECRET_NAME);
    app.locals.jwtSecret = dbSecrets.JWT_SECRET;
    console.log("✅ Connecting to database at:", dbSecrets.DATABASE_URL.split('@')[1])

    // Create database connection pool using DATABASE_URL
    dbPool = new Pool({
      connectionString: dbSecrets.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    })

    // Test database connection
    await dbPool.query("SELECT NOW()")
    console.log("✅ Database connection successful")

    // Export database pool for use in routes
    app.locals.db = dbPool

    // Routes
    app.use("/api/auth", authRoutes)
    app.use("/api/visits", visitRoutes)
    app.use("/api/documents", documentRoutes)

    // Health check endpoint
    app.get("/health", (req, res) => {
      res.status(200).json({ status: "ok" })
    })

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
  } catch (error) {
    console.error("❌ Failed to initialize application:", error)
    process.exit(1)
  }
}

// Handle graceful shutdown
process.on("SIGINT", async () => {
  if (dbPool) {
    await dbPool.end()
  }
  process.exit(0)
})

// Start the app
initializeApp()
