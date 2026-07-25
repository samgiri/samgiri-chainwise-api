-- Users Table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  mobile VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  source VARCHAR(50),
  email_verified BOOLEAN DEFAULT FALSE,
  alerts_enabled BOOLEAN DEFAULT TRUE,
  preferences JSONB DEFAULT '{}'
);

-- Case Studies Table
CREATE TABLE case_studies (
  id SERIAL PRIMARY KEY,
  protocol_name VARCHAR(255) NOT NULL,
  contract_address VARCHAR(66) NOT NULL,
  chain VARCHAR(50) NOT NULL,
  risk_score INTEGER CHECK (risk_score >= 0 AND risk_score <= 100),
  confidence DECIMAL(3,2),
  classification VARCHAR(100),
  analysis JSONB NOT NULL,
  case_study_html TEXT,
  predicted_collapse VARCHAR(500),
  estimated_loss VARCHAR(100),
  published BOOLEAN DEFAULT FALSE,
  published_date TIMESTAMP,
  created_by VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50)
);

-- Alerts Table
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  case_id INTEGER REFERENCES case_studies(id) ON DELETE CASCADE,
  sent_date TIMESTAMP DEFAULT NOW(),
  channel VARCHAR(50),
  status VARCHAR(50),
  response_data JSONB
);

-- API Keys Table
CREATE TABLE api_keys (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  rate_limit INTEGER DEFAULT 100,
  calls_today INTEGER DEFAULT 0,
  last_reset TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  revoked BOOLEAN DEFAULT FALSE
);

-- Indexes
CREATE INDEX idx_case_studies_risk_score ON case_studies(risk_score);
CREATE INDEX idx_case_studies_chain ON case_studies(chain);
CREATE INDEX idx_case_studies_published ON case_studies(published);
CREATE INDEX idx_alerts_user_id ON alerts(user_id);
CREATE INDEX idx_api_keys_key ON api_keys(api_key);
