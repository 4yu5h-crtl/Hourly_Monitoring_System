import { ShiftLog, HourlyEntry } from "@/types/hms";

function escapeCsv(str: string | number | null | undefined): string {
  if (str === null || str === undefined) return "";
  const stringified = String(str).replace(/"/g, '""');
  if (stringified.search(/("|,|\n)/g) >= 0) {
    return `"${stringified}"`;
  }
  return stringified;
}

export function exportToCSV(logs: ShiftLog[], date: string) {
  // Sort logs by shift ID to ensure correct chronological order (1st, 2nd, 3rd)
  const sortedLogs = [...logs].sort((a, b) => a.shiftId - b.shiftId);

  // If we don't have logs, we can still construct headers but there will be no data
  const sampleLog = sortedLogs[0] || {} as Partial<ShiftLog>;

  const rootHeader1 = [
    "SKF", "Hourly Monitoring System", "HMS", 
    `Channel: ${sampleLog.channel || ""}`,
    `Date: ${date}`,
    `Machine: ${sampleLog.machine || ""}`
  ];

  const headers = [
    "PERIOD", "CUM QTY", "HRLY QTY", "+/- STDS", "Reasons for Loss",
    "CT Loss (6111)", "Start up Loss (6112)", "MAINT (5135)", "RESET (5133)",
    "Material (5138)", "Supplier (5131)", "Tool (5134T)", "Spindle Services (5134S)",
    "Wheel change", "OPTR (6114)", "PLN STOP (6113)", "QLTY (5137)", "SYSTEM (5132/5139)",
    "SCRAP QTY", "Total Production", "Efficiency %"
  ];

  let csvRows = [];
  csvRows.push(rootHeader1.map(escapeCsv).join(","));
  csvRows.push(headers.map(escapeCsv).join(","));

  sortedLogs.forEach((log) => {
    // Add row to indicate start of shift
    csvRows.push(`"--- Shift ${log.shiftId} ---"`);
    
    // Add each time slot entry
    log.entries.forEach((entry: HourlyEntry) => {
      const row = [
        entry.timeSlot,
        entry.cumQty,
        entry.hrlyQty,
        entry.stdVariance !== null ? ((entry.stdVariance >= 0 ? "+" : "") + entry.stdVariance) : "",
        entry.reasonsText,
        entry.lossDetails.ct_loss,
        entry.lossDetails.start_loss,
        entry.lossDetails.maintenance,
        entry.lossDetails.reset,
        entry.lossDetails.material,
        entry.lossDetails.supplier,
        entry.lossDetails.tool,
        entry.lossDetails.spindle_service,
        entry.lossDetails.wheel_change,
        entry.lossDetails.operator,
        entry.lossDetails.plan_stop,
        entry.lossDetails.quality,
        entry.lossDetails.system,
        "", // Scrap Qty row placeholder for entries (usually recorded per shift ending)
        "", // Total Production placeholder
        ""  // Efficiency placeholder
      ];
      csvRows.push(row.map(escapeCsv).join(","));
    });

    // Add shift summary row at the end of the shift
    const summaryRow = Array(headers.length).fill("");
    summaryRow[0] = `Shift ${log.shiftId} Summary`;
    summaryRow[18] = log.summary.scrapQty; // Scrap Qty
    summaryRow[19] = log.summary.totalProduction; // Total Production
    summaryRow[20] = log.summary.efficiency; // Efficiency
    
    csvRows.push(summaryRow.map(escapeCsv).join(","));
  });

  if (sortedLogs.length === 0) {
    csvRows.push(escapeCsv("No data available for this date."));
  }

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `HMS_Data_${date}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
