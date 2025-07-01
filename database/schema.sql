-- Dashboard Database Schema
-- This file contains all the table definitions for the dashboard application

-- Create database if it doesn't exist
-- CREATE DATABASE dashboard_db;

-- Connect to the database
-- \c dashboard_db;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Unique Permits Yearly Data
CREATE TABLE IF NOT EXISTS unique_permits_yearly (
    id SERIAL PRIMARY KEY,
    fiscal_year INTEGER NOT NULL,
    permit_count INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(fiscal_year)
);

-- Department Annual Activity Data
CREATE TABLE IF NOT EXISTS department_activity (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    activity_count INTEGER NOT NULL,
    department VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, department)
);

-- Department Activity by Weekday
CREATE TABLE IF NOT EXISTS department_activity_weekday (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    monday DECIMAL(10, 6) NOT NULL,
    tuesday DECIMAL(10, 6) NOT NULL,
    wednesday DECIMAL(10, 6) NOT NULL,
    thursday DECIMAL(10, 6) NOT NULL,
    friday DECIMAL(10, 6) NOT NULL,
    department VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year, department)
);

-- Unique Permits Monthly Data
CREATE TABLE IF NOT EXISTS unique_permits_monthly (
    id SERIAL PRIMARY KEY,
    month VARCHAR(20) NOT NULL,
    permit_count INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(month, year)
);

-- Unique Permits Quarterly Data
CREATE TABLE IF NOT EXISTS unique_permits_quarterly (
    id SERIAL PRIMARY KEY,
    quarter VARCHAR(10) NOT NULL,
    permit_count INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(quarter, year)
);

-- Unique Permits Yearly Bins Data
CREATE TABLE IF NOT EXISTS unique_permits_yearly_bins (
    id SERIAL PRIMARY KEY,
    bin_range VARCHAR(50) NOT NULL,
    permit_count INTEGER NOT NULL,
    year INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(bin_range, year)
);

-- Users table (for future authentication)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    preference_key VARCHAR(100) NOT NULL,
    preference_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, preference_key)
);

-- Audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_unique_permits_yearly_fiscal_year ON unique_permits_yearly(fiscal_year);
CREATE INDEX IF NOT EXISTS idx_department_activity_year ON department_activity(year);
CREATE INDEX IF NOT EXISTS idx_department_activity_department ON department_activity(department);
CREATE INDEX IF NOT EXISTS idx_department_activity_weekday_department ON department_activity_weekday(department);
CREATE INDEX IF NOT EXISTS idx_unique_permits_monthly_year ON unique_permits_monthly(year);
CREATE INDEX IF NOT EXISTS idx_unique_permits_quarterly_year ON unique_permits_quarterly(year);
CREATE INDEX IF NOT EXISTS idx_unique_permits_yearly_bins_year ON unique_permits_yearly_bins(year);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_unique_permits_yearly_updated_at BEFORE UPDATE ON unique_permits_yearly FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_department_activity_updated_at BEFORE UPDATE ON department_activity FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_department_activity_weekday_updated_at BEFORE UPDATE ON department_activity_weekday FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unique_permits_monthly_updated_at BEFORE UPDATE ON unique_permits_monthly FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unique_permits_quarterly_updated_at BEFORE UPDATE ON unique_permits_quarterly FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_unique_permits_yearly_bins_updated_at BEFORE UPDATE ON unique_permits_yearly_bins FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 