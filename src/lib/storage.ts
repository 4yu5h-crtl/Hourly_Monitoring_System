import {
  ShiftLog, HourlyEntry, ProductionSummary,
} from "@/types/hms";
import * as api from "./api";

// Session cache types - minimal storage footprint
export interface SessionCache {
  date: string;
  shiftId: number;
  machine: string;
  channel: string;
  logId: string;
  timestamp: number; // When this session was created/loaded
}

// localStorage keys - for long-term session tracking
const SESSION_KEY = 'hms_current_session';
const SESSIONS_LIST_KEY = 'hms_sessions_list'; // Track all sessions for cleanup
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

// sessionStorage keys - for current session data (persists during browser session)
const SESSION_DATA_KEY = 'hms_session_data';

/**
 * Save full shift log to sessionStorage for instant access across tab switches
 * sessionStorage clears when browser tab closes, preventing bloat
 */
export function saveShiftLogToSessionStorage(log: ShiftLog): void {
  try {
    sessionStorage.setItem(SESSION_DATA_KEY, JSON.stringify(log));
  } catch (e) {
    console.warn('Failed to save log to sessionStorage:', e);
  }
}

/**
 * Get full shift log from sessionStorage
 */
export function getShiftLogFromSessionStorage(): ShiftLog | null {
  try {
    const data = sessionStorage.getItem(SESSION_DATA_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.warn('Failed to retrieve log from sessionStorage:', e);
    return null;
  }
}

/**
 * Clear shift log from sessionStorage
 */
export function clearShiftLogFromSessionStorage(): void {
  try {
    sessionStorage.removeItem(SESSION_DATA_KEY);
  } catch (e) {
    console.warn('Failed to clear sessionStorage:', e);
  }
}

/**
 * Save current session info to localStorage (metadata only, very lightweight)
 */
export function saveSessionToCache(
  date: string,
  shiftId: number,
  machine: string,
  channel: string,
  logId: string
): void {
  const session: SessionCache = {
    date,
    shiftId,
    machine,
    channel,
    logId,
    timestamp: Date.now(),
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  // Track all sessions for cleanup
  trackSessionForCleanup(logId);
  cleanupExpiredSessions();
}

/**
 * Track session ID for periodic cleanup
 */
function trackSessionForCleanup(logId: string): void {
  try {
    const sessions = JSON.parse(localStorage.getItem(SESSIONS_LIST_KEY) || '{}');
    sessions[logId] = Date.now();
    localStorage.setItem(SESSIONS_LIST_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.warn('Failed to track session:', e);
  }
}

/**
 * Clean up sessions older than CACHE_EXPIRY_MS
 */
function cleanupExpiredSessions(): void {
  try {
    const sessions = JSON.parse(localStorage.getItem(SESSIONS_LIST_KEY) || '{}');
    const now = Date.now();
    const activeSessionId = getSessionFromCache()?.logId;

    for (const [logId, timestamp] of Object.entries(sessions)) {
      // Keep current session and sessions newer than 24 hours
      if (now - (timestamp as number) > CACHE_EXPIRY_MS && logId !== activeSessionId) {
        delete sessions[logId];
      }
    }

    localStorage.setItem(SESSIONS_LIST_KEY, JSON.stringify(sessions));
  } catch (e) {
    console.warn('Failed to cleanup sessions:', e);
  }
}

/**
 * Get current session from localStorage (metadata only)
 */
export function getSessionFromCache(): SessionCache | null {
  try {
    const data = localStorage.getItem(SESSION_KEY);
    if (!data) return null;

    const session: SessionCache = JSON.parse(data);

    // Check if session has expired
    if (Date.now() - session.timestamp > CACHE_EXPIRY_MS) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }

    return session;
  } catch (e) {
    console.warn('Failed to parse session cache:', e);
    return null;
  }
}

/**
 * Clear current session from localStorage
 */
export function clearSessionCache(): void {
  localStorage.removeItem(SESSION_KEY);
}

/**
 * Check if cached session matches current params and is not expired
 */
export function isCachedSessionValid(
  date: string,
  shiftId: number,
  machine: string,
  channel: string
): boolean {
  const cached = getSessionFromCache();
  if (!cached) return false;

  return (
    cached.date === date &&
    cached.shiftId === shiftId &&
    cached.machine === machine &&
    cached.channel === channel
  );
}

export async function getOrCreateShiftLog(
  date: string, shiftId: number, machine: string, channel: string
): Promise<ShiftLog> {
  // Always fetch fresh data from server for accuracy
  const apiLog = await api.createOrGetShift(date, shiftId, machine, channel);
  const fullLog = await api.getShift(apiLog.id);
  const shiftLog = convertApiLogToShiftLog(fullLog);

  // Cache session metadata and full data
  saveSessionToCache(date, shiftId, machine, channel, shiftLog.id);
  saveShiftLogToSessionStorage(shiftLog);

  return shiftLog;
}

export async function saveEntry(logId: string, entry: HourlyEntry, selectedMachine: string | null): Promise<void> {
  const lossDetails = entry.lossDetails;

  // Update entry in MySQL - send input and calculated fields
  await api.updateEntry(entry.id, {
    cum_qty: entry.cumQty,
    hrly_qty: entry.hrlyQty,
    std_variance: entry.stdVariance,
    reasons_text: entry.reasonsText,
    edited: entry.edited,
  });

  // Persist machine-attributed loss only when a machine is selected.
  if (selectedMachine) {
    await api.updateLossDetails(entry.id, {
      loss_machine: selectedMachine,
      ct_loss: lossDetails.ct_loss,
      ct_loss_reason: lossDetails.ct_loss_reason,
      start_loss: lossDetails.start_loss,
      start_loss_reason: lossDetails.start_loss_reason,
      mech_maintenance: lossDetails.mech_maintenance,
      mech_maintenance_reason: lossDetails.mech_maintenance_reason,
      elect_maintenance: lossDetails.elect_maintenance,
      elect_maintenance_reason: lossDetails.elect_maintenance_reason,
      reset: lossDetails.reset,
      reset_reason: lossDetails.reset_reason,
      machine_adjustment: lossDetails.machine_adjustment,
      machine_adjustment_reason: lossDetails.machine_adjustment_reason,
      supplier: lossDetails.supplier,
      supplier_reason: lossDetails.supplier_reason,
      shared_operation: lossDetails.shared_operation,
      shared_operation_reason: lossDetails.shared_operation_reason,
      tool: lossDetails.tool,
      tool_reason: lossDetails.tool_reason,
      spindle_service: lossDetails.spindle_service,
      spindle_service_reason: lossDetails.spindle_service_reason,
      wheel_change: lossDetails.wheel_change,
      wheel_change_reason: lossDetails.wheel_change_reason,
      operator: lossDetails.operator,
      operator_reason: lossDetails.operator_reason,
      plan_stop: lossDetails.plan_stop,
      plan_stop_reason: lossDetails.plan_stop_reason,
      quality: lossDetails.quality,
      quality_reason: lossDetails.quality_reason,
      system_loss: lossDetails.system,
      system_reason: lossDetails.system_reason,
    });
  }

  // Update sessionStorage with latest data
  const log = getShiftLogFromSessionStorage();
  if (log) {
    const updatedEntries = log.entries.map((e) => (e.id === entry.id ? entry : e));
    const updatedLog = { ...log, entries: updatedEntries };
    saveShiftLogToSessionStorage(updatedLog);
  }
}

export async function saveSummary(logId: string, summary: ProductionSummary): Promise<void> {
  await api.updateSummary(logId, {
    total_production: summary.totalProduction,
    scrap: summary.scrap,
    scrap_qty: summary.scrapQty,
    rework: summary.rework,
    efficiency: summary.efficiency,
    quality_status: summary.qualityStatus,
    std_ct: summary.stdCT,
    std_prod_hr: summary.stdProdHr,
    actual_ct: summary.actualCT,
    actual_prod_hr: summary.actualProdHr,
    machine_name: summary.machineName,
    b_n_machine: summary.bNMachine,
    shift_engineer_approval: summary.shiftEngineerApproval,
    manager_approval: summary.managerApproval,
  });

  // Update sessionStorage with latest data
  const log = getShiftLogFromSessionStorage();
  if (log) {
    const updatedLog = { ...log, summary };
    saveShiftLogToSessionStorage(updatedLog);
  }
}

export async function getLogsForDate(date: string): Promise<ShiftLog[]> {
  const apiLogs = await api.getShifts(date);
  return Promise.all(
    apiLogs.map((log: any) => api.getShift(log.id).then(convertApiLogToShiftLog))
  );
}

// Convert API response to ShiftLog format
function convertApiLogToShiftLog(apiLog: any): ShiftLog {
  return {
    id: apiLog.id,
    date: apiLog.date,
    shiftId: apiLog.shift_id,
    machine: apiLog.machine,
    channel: apiLog.channel,
    entries: (apiLog.entries || []).map((entry: any) => ({
      id: entry.id,
      timeSlot: entry.time_slot,
      cumQty: entry.cum_qty,
      hrlyQty: entry.hrly_qty,
      stdVariance: entry.std_variance,
      reasonsText: entry.reasons_text || "",
      lossDetails: {
        ct_loss: entry.lossDetails?.ct_loss || null,
        ct_loss_reason: entry.lossDetails?.ct_loss_reason || "",
        start_loss: entry.lossDetails?.start_loss || null,
        start_loss_reason: entry.lossDetails?.start_loss_reason || "",
        mech_maintenance: entry.lossDetails?.mech_maintenance || null,
        mech_maintenance_reason: entry.lossDetails?.mech_maintenance_reason || "",
        elect_maintenance: entry.lossDetails?.elect_maintenance || null,
        elect_maintenance_reason: entry.lossDetails?.elect_maintenance_reason || "",
        reset: entry.lossDetails?.reset || null,
        reset_reason: entry.lossDetails?.reset_reason || "",
        machine_adjustment: entry.lossDetails?.machine_adjustment || null,
        machine_adjustment_reason: entry.lossDetails?.machine_adjustment_reason || "",
        supplier: entry.lossDetails?.supplier || null,
        supplier_reason: entry.lossDetails?.supplier_reason || "",
        shared_operation: entry.lossDetails?.shared_operation || null,
        shared_operation_reason: entry.lossDetails?.shared_operation_reason || "",
        tool: entry.lossDetails?.tool || null,
        tool_reason: entry.lossDetails?.tool_reason || "",
        spindle_service: entry.lossDetails?.spindle_service || null,
        spindle_service_reason: entry.lossDetails?.spindle_service_reason || "",
        wheel_change: entry.lossDetails?.wheel_change || null,
        wheel_change_reason: entry.lossDetails?.wheel_change_reason || "",
        operator: entry.lossDetails?.operator || null,
        operator_reason: entry.lossDetails?.operator_reason || "",
        plan_stop: entry.lossDetails?.plan_stop || null,
        plan_stop_reason: entry.lossDetails?.plan_stop_reason || "",
        quality: entry.lossDetails?.quality || null,
        quality_reason: entry.lossDetails?.quality_reason || "",
        system: entry.lossDetails?.system_loss || null,
        system_reason: entry.lossDetails?.system_reason || "",
      },
      edited: entry.edited || false,
    })),
    summary: {
      totalProduction: apiLog.summary?.total_production || null,
      scrap: apiLog.summary?.scrap || null,
      scrapQty: apiLog.summary?.scrap_qty || null,
      rework: apiLog.summary?.rework || null,
      efficiency: apiLog.summary?.efficiency || null,
      qualityStatus: apiLog.summary?.quality_status || "",
      stdCT: apiLog.summary?.std_ct || null,
      stdProdHr: apiLog.summary?.std_prod_hr || null,
      actualCT: apiLog.summary?.actual_ct || null,
      actualProdHr: apiLog.summary?.actual_prod_hr || null,
      machineName: apiLog.summary?.machine_name || "",
      bNMachine: apiLog.summary?.b_n_machine || "",
      shiftEngineerApproval: apiLog.summary?.shift_engineer_approval || "",
      managerApproval: apiLog.summary?.manager_approval || "",
    },
  };
}

export function recalculate(entries: HourlyEntry[], actualProdHr: number | null): HourlyEntry[] {
  return entries.map((entry, i) => {
    // Calculate hourly qty from cumulative
    let hrlyQty: number | null = null;
    if (entry.cumQty !== null) {
      if (i === 0) {
        hrlyQty = entry.cumQty;
      } else {
        const prev = entries[i - 1];
        hrlyQty = prev.cumQty !== null ? entry.cumQty - prev.cumQty : entry.cumQty;
      }
    }
    // Calculate std variance as difference from actual production per hour
    const stdVariance = (hrlyQty !== null && actualProdHr !== null) ? hrlyQty - actualProdHr : null;
    return { ...entry, hrlyQty, stdVariance };
  });
}
