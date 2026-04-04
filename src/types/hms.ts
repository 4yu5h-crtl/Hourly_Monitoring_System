export interface ShiftConfig {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
  timeSlots: string[];
}

export const SHIFTS: ShiftConfig[] = [
  {
    id: 1,
    name: "1st Shift",
    startTime: "06:54",
    endTime: "15:24",
    timeSlots: [
      "06:54 - 07:54", "07:54 - 08:54", "08:54 - 09:54",
      "09:54 - 10:54", "10:54 - 11:54", "11:54 - 12:54",
      "12:54 - 13:54", "13:54 - 14:54", "14:54 - 15:24"
    ],
  },
  {
    id: 2,
    name: "2nd Shift",
    startTime: "15:24",
    endTime: "23:36",
    timeSlots: [
      "15:24 - 16:24", "16:24 - 17:24", "17:24 - 18:24",
      "18:24 - 19:24", "19:24 - 20:24", "20:24 - 21:24",
      "21:24 - 22:24", "22:24 - 23:36"
    ],
  },
  {
    id: 3,
    name: "3rd Shift",
    startTime: "23:36",
    endTime: "06:54",
    timeSlots: [
      "23:36 - 00:36", "00:36 - 01:36", "01:36 - 02:36",
      "02:36 - 03:36", "03:36 - 04:36", "04:36 - 05:36",
      "05:36 - 06:36", "06:36 - 06:54"
    ],
  },
];

export const LOSS_COLUMNS = [
  { key: "ct_loss", label: "CT Loss", code: "6111" },
  { key: "start_loss", label: "Start Loss", code: "6112" },
  { key: "maintenance", label: "MAINT", code: "5135" },
  { key: "reset", label: "RESET", code: "5133" },
  { key: "material", label: "Material", code: "5138" },
  { key: "supplier", label: "Supplier", code: "5131" },
  { key: "tool", label: "Tool", code: "5134T" },
  { key: "spindle_service", label: "Spindle Svc", code: "5134S" },
  { key: "wheel_change", label: "Wheel", code: "" },
  { key: "operator", label: "OPTR", code: "6114" },
  { key: "plan_stop", label: "PLN STOP", code: "6113" },
  { key: "quality", label: "QLTY", code: "5137" },
  { key: "system", label: "SYSTEM", code: "5132/5139" },
] as const;

export type LossKey = typeof LOSS_COLUMNS[number]["key"];

export interface LossDetails {
  ct_loss: number | null;
  start_loss: number | null;
  maintenance: number | null;
  reset: number | null;
  material: number | null;
  supplier: number | null;
  tool: number | null;
  spindle_service: number | null;
  wheel_change: number | null;
  operator: number | null;
  plan_stop: number | null;
  quality: number | null;
  system: number | null;
}

export interface HourlyEntry {
  id: string;
  timeSlot: string;
  cumQty: number | null;
  hrlyQty: number | null;
  stdVariance: number | null;
  reasonsText: string;
  lossDetails: LossDetails;
  edited: boolean;
}

export interface ProductionSummary {
  totalProduction: number | null;
  scrap: number | null;
  rework: number | null;
  efficiency: number | null;
  qualityStatus: string;
  shiftEngineerApproval: string;
  managerApproval: string;
  machineName: string;
  scrapQty: number | null;
  bNMachine: string;
  stdCT: number | null;
  stdProdHr: number | null;
  actualCT: number | null;
  actualProdHr: number | null;
}

export interface ShiftLog {
  id: string;
  date: string;
  shiftId: number;
  machine: string;
  channel: string;
  entries: HourlyEntry[];
  summary: ProductionSummary;
}

export type SaveStatus = "idle" | "saving" | "saved" | "error";

export const QUICK_INSERT_PHRASES = [
  { label: "Wheel Change", text: "Wheel change performed" },
  { label: "Tool Issue", text: "Tool breakage / replacement" },
  { label: "Maintenance", text: "Scheduled maintenance" },
  { label: "Setup", text: "Machine setup / adjustment" },
  { label: "Material Wait", text: "Waiting for material" },
  { label: "Quality Check", text: "Quality inspection hold" },
];

export function createEmptyLossDetails(): LossDetails {
  return {
    ct_loss: null, start_loss: null, maintenance: null, reset: null,
    material: null, supplier: null, tool: null, spindle_service: null,
    wheel_change: null, operator: null, plan_stop: null, quality: null,
    system: null,
  };
}

export function createEmptyEntry(timeSlot: string): HourlyEntry {
  return {
    id: crypto.randomUUID(),
    timeSlot,
    cumQty: null,
    hrlyQty: null,
    stdVariance: null,
    reasonsText: "",
    lossDetails: createEmptyLossDetails(),
    edited: false,
  };
}

export function createEmptySummary(): ProductionSummary {
  return {
    totalProduction: null, scrap: null, rework: null, efficiency: null,
    qualityStatus: "", shiftEngineerApproval: "", managerApproval: "",
    machineName: "", scrapQty: null, bNMachine: "", stdCT: null,
    stdProdHr: null, actualCT: null, actualProdHr: null,
  };
}
