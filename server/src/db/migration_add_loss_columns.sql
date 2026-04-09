-- Migration: Add calculated field columns and loss reason columns
-- This migration:
-- 1. Adds hrly_qty and std_variance if they don't exist (for backwards compatibility)
-- 2. Adds all loss reason columns
-- Run this on existing databases to update the schema

USE hms_system;

-- Add calculated columns if they don't exist (for existing databases)
ALTER TABLE hourly_entries ADD COLUMN IF NOT EXISTS hrly_qty INT AFTER cum_qty;
ALTER TABLE hourly_entries ADD COLUMN IF NOT EXISTS std_variance INT AFTER hrly_qty;

-- Add new value columns if they don't exist
ALTER TABLE loss_details
ADD COLUMN IF NOT EXISTS loss_machine VARCHAR(100) AFTER hourly_entry_id,
ADD COLUMN IF NOT EXISTS mech_maintenance INT AFTER start_loss,
ADD COLUMN IF NOT EXISTS elect_maintenance INT AFTER mech_maintenance,
ADD COLUMN IF NOT EXISTS machine_adjustment INT AFTER reset,
ADD COLUMN IF NOT EXISTS shared_operation INT AFTER supplier;

-- Add new reason columns
ALTER TABLE loss_details
ADD COLUMN IF NOT EXISTS ct_loss_reason TEXT AFTER ct_loss,
ADD COLUMN IF NOT EXISTS start_loss_reason TEXT AFTER start_loss,
ADD COLUMN IF NOT EXISTS mech_maintenance_reason TEXT AFTER mech_maintenance,
ADD COLUMN IF NOT EXISTS elect_maintenance_reason TEXT AFTER elect_maintenance,
ADD COLUMN IF NOT EXISTS reset_reason TEXT AFTER reset,
ADD COLUMN IF NOT EXISTS machine_adjustment_reason TEXT AFTER machine_adjustment,
ADD COLUMN IF NOT EXISTS supplier_reason TEXT AFTER supplier,
ADD COLUMN IF NOT EXISTS shared_operation_reason TEXT AFTER shared_operation,
ADD COLUMN IF NOT EXISTS tool_reason TEXT AFTER tool,
ADD COLUMN IF NOT EXISTS spindle_service_reason TEXT AFTER spindle_service,
ADD COLUMN IF NOT EXISTS wheel_change_reason TEXT AFTER wheel_change,
ADD COLUMN IF NOT EXISTS operator_reason TEXT AFTER operator,
ADD COLUMN IF NOT EXISTS plan_stop_reason TEXT AFTER plan_stop,
ADD COLUMN IF NOT EXISTS quality_reason TEXT AFTER quality,
ADD COLUMN IF NOT EXISTS system_reason TEXT AFTER system_loss;

COMMIT;
