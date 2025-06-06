# Patient Health Management System

A full-stack application for managing patient health records, built with React, Node.js, PostgreSQL, and AWS services.

## Features

- User authentication and authorization
- Patient health record management
- Document upload and storage
- Visit tracking and management
- Secure file storage using AWS S3
- JWT-based authentication

## Prerequisites

- Docker and Docker Compose
- AWS account with necessary permissions
- PostgreSQL database (configured in AWS Secrets Manager)

## Project Structure

- `backend/health-records-service`: Node.js backend service for managing patient health records.
- `backend/python-service`: Python service for processing patient health records.
- `frontend`: React frontend application for managing patient health records.

## Setup Instructions

1. Backend
    cd backend/health-records-service
docker build -t patient-health-backend .

docker run -d \
  --name patient-health-backend \
  --network okla \
  -p 5000:5000 \
  -e AWS_REGION=us-east-2 \
  -e DB_SECRET_NAME=patient-health-system-secrets \
  -e PORT=5000 \
  patient-health-backend:latest

2. Frontend
    cd frontend
    
    docker build -t patient-health-frontend \
  --build-arg REACT_APP_API_URL=http://3.135.214.63:5000/api \
  .
    docker run -d \
  --name patient-health-frontend \
  --network okla \
  -p 80:80 \
  patient-health-frontend:latest


  3. python service
  cd backend/python-service
docker build -t patient-health-python .

docker run -d \
  --name patient-health-python \
  --network okla \
  -p 5001:5001 \
  -e AWS_REGION=us-east-2 \
  -e S3_BUCKET_NAME=patient-health-history-bucket \
  -e DB_SECRET_NAME=patient-health-system-secrets \
  -e PORT=5001 \
  patient-health-python:latest