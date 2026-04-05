-- Create HMS Database
CREATE DATABASE IF NOT EXISTS hms_system;
USE hms_system;

-- Shift Logs Table
CREATE TABLE IF NOT EXISTS shift_logs (
  id VARCHAR(36) PRIMARY KEY,
  date DATE NOT NULL,
  shift_id INT NOT NULL,
  machine VARCHAR(100) NOT NULL,
  channel VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_shift_log (date, shift_id, machine, channel),
  INDEX idx_date (date),
  INDEX idx_shift (shift_id),
  INDEX idx_machine (machine)
);

-- Hourly Entries Table
CREATE TABLE IF NOT EXISTS hourly_entries (
  id VARCHAR(36) PRIMARY KEY,
  shift_log_id VARCHAR(36) NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  cum_qty INT,
  hrly_qty INT,
  std_variance INT,
  reasons_text LONGTEXT,
  edited BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_log_id) REFERENCES shift_logs(id) ON DELETE CASCADE,
  INDEX idx_shift_log (shift_log_id),
  INDEX idx_time_slot (time_slot)
);

-- Loss Details Table
CREATE TABLE IF NOT EXISTS loss_details (
  id VARCHAR(36) PRIMARY KEY,
  hourly_entry_id VARCHAR(36) NOT NULL,
  ct_loss INT,
  start_loss INT,
  maintenance INT,
  reset INT,
  material INT,
  supplier INT,
  tool INT,
  spindle_service INT,
  wheel_change INT,
  operator INT,
  plan_stop INT,
  quality INT,
  system_loss INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (hourly_entry_id) REFERENCES hourly_entries(id) ON DELETE CASCADE,
  UNIQUE KEY unique_loss (hourly_entry_id),
  INDEX idx_hourly_entry (hourly_entry_id)
);

-- Production Summary Table
CREATE TABLE IF NOT EXISTS production_summary (
  id VARCHAR(36) PRIMARY KEY,
  shift_log_id VARCHAR(36) NOT NULL,
  total_production INT,
  scrap INT,
  scrap_qty INT,
  rework INT,
  efficiency DECIMAL(5, 2),
  quality_status VARCHAR(255),
  std_ct DECIMAL(8, 2),
  std_prod_hr INT,
  actual_ct DECIMAL(8, 2),
  actual_prod_hr INT,
  machine_name VARCHAR(255),
  b_n_machine VARCHAR(255),
  shift_engineer_approval VARCHAR(255),
  manager_approval VARCHAR(255),
  present_operators VARCHAR(255),
  absent_operators VARCHAR(255),
  total_loss_qty INT,
  total_loss_hrs DECIMAL(5, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (shift_log_id) REFERENCES shift_logs(id) ON DELETE CASCADE,
  UNIQUE KEY unique_summary (shift_log_id),
  INDEX idx_shift_log (shift_log_id)
);

-- Create indexes for faster queries
CREATE INDEX idx_shift_logs_date_shift ON shift_logs(date, shift_id);
CREATE INDEX idx_hourly_entries_shift_log ON hourly_entries(shift_log_id);
CREATE INDEX idx_loss_details_hourly_entry ON loss_details(hourly_entry_id);
CREATE INDEX idx_production_summary_shift_log ON production_summary(shift_log_id);

-- Insert standard configuration if needed (optional)
-- This can store standard production rates and other constants
CREATE TABLE IF NOT EXISTS system_config (
  id INT PRIMARY KEY AUTO_INCREMENT,
  config_key VARCHAR(100) UNIQUE NOT NULL,
  config_value VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
