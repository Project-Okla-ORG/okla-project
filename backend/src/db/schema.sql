-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  date_of_birth DATE,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP
);

-- Create visits table
CREATE TABLE IF NOT EXISTS visits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL,
  hospital_name VARCHAR(255) NOT NULL,
  doctor_name VARCHAR(255) NOT NULL,
  reason_for_visit TEXT NOT NULL,
  prescription_notes TEXT,
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
  id SERIAL PRIMARY KEY,
  visit_id INTEGER NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100) NOT NULL,
  s3_key VARCHAR(500) NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP NOT NULL,
  CONSTRAINT fk_visit FOREIGN KEY (visit_id) REFERENCES visits(id)
);

-- Create indexes
CREATE INDEX idx_visits_user_id ON visits(user_id);
CREATE INDEX idx_documents_visit_id ON documents(visit_id);
