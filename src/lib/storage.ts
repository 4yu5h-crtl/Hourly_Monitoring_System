import {
  ShiftLog, HourlyEntry, ProductionSummary,
} from "@/types/hms";
import * as api from "./api";

export async function getOrCreateShiftLog(
  date: string, shiftId: number, machine: string, channel: string
): Promise<ShiftLog> {
  // Create or get the shift log from MySQL via API
  const apiLog = await api.createOrGetShift(date, shiftId, machine, channel);

  // Fetch full details (entries + loss details + summary)
  const fullLog = await api.getShift(apiLog.id);
  return convertApiLogToShiftLog(fullLog);
}

export async function saveEntry(logId: string, entry: HourlyEntry): Promise<void> {
  const lossDetails = entry.lossDetails;

  // Update entry in MySQL
  await api.updateEntry(entry.id, {
    cum_qty: entry.cumQty,
    hrly_qty: entry.hrlyQty,
    std_variance: entry.stdVariance,
    reasons_text: entry.reasonsText,
    edited: entry.edited,
  });

  // Update loss details in MySQL
  await api.updateLossDetails(entry.id, {
    ct_loss: lossDetails.ct_loss,
    start_loss: lossDetails.start_loss,
    maintenance: lossDetails.maintenance,
    reset: lossDetails.reset,
    material: lossDetails.material,
    supplier: lossDetails.supplier,
    tool: lossDetails.tool,
    spindle_service: lossDetails.spindle_service,
    wheel_change: lossDetails.wheel_change,
    operator: lossDetails.operator,
    plan_stop: lossDetails.plan_stop,
    quality: lossDetails.quality,
    system_loss: lossDetails.system,
  });
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
        start_loss: entry.lossDetails?.start_loss || null,
        maintenance: entry.lossDetails?.maintenance || null,
        reset: entry.lossDetails?.reset || null,
        material: entry.lossDetails?.material || null,
        supplier: entry.lossDetails?.supplier || null,
        tool: entry.lossDetails?.tool || null,
        spindle_service: entry.lossDetails?.spindle_service || null,
        wheel_change: entry.lossDetails?.wheel_change || null,
        operator: entry.lossDetails?.operator || null,
        plan_stop: entry.lossDetails?.plan_stop || null,
        quality: entry.lossDetails?.quality || null,
        system: entry.lossDetails?.system_loss || null,
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

export function recalculate(entries: HourlyEntry[], stdTarget: number): HourlyEntry[] {
  return entries.map((entry, i) => {
    let hrlyQty: number | null = null;
    if (entry.cumQty !== null) {
      if (i === 0) {
        hrlyQty = entry.cumQty;
      } else {
        const prev = entries[i - 1];
        hrlyQty = prev.cumQty !== null ? entry.cumQty - prev.cumQty : entry.cumQty;
      }
    }
    const stdVariance = hrlyQty !== null ? hrlyQty - stdTarget : null;
    return { ...entry, hrlyQty, stdVariance };
  });
}
