import { v4 as uuidv4 } from 'uuid';

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
    startTime: "06:54 AM",
    endTime: "03:24 PM",
    timeSlots: [
      "06:54 AM - 07:54 AM", "07:54 AM - 08:54 AM", "08:54 AM - 09:54 AM",
      "09:54 AM - 10:54 AM", "10:54 AM - 11:54 AM", "11:54 AM - 12:54 PM",
      "12:54 PM - 01:54 PM", "01:54 PM - 02:54 PM", "02:54 PM - 03:24 PM"
    ],
  },
  {
    id: 2,
    name: "2nd Shift",
    startTime: "03:24 PM",
    endTime: "11:36 PM",
    timeSlots: [
      "03:24 PM - 04:24 PM", "04:24 PM - 05:24 PM", "05:24 PM - 06:24 PM",
      "06:24 PM - 07:24 PM", "07:24 PM - 08:24 PM", "08:24 PM - 09:24 PM",
      "09:24 PM - 10:24 PM", "10:24 PM - 11:36 PM"
    ],
  },
  {
    id: 3,
    name: "3rd Shift",
    startTime: "11:36 PM",
    endTime: "06:54 AM",
    timeSlots: [
      "11:36 PM - 12:36 AM", "12:36 AM - 01:36 AM", "01:36 AM - 02:36 AM",
      "02:36 AM - 03:36 AM", "03:36 AM - 04:36 AM", "04:36 AM - 05:36 AM",
      "05:36 AM - 06:36 AM", "06:36 AM - 06:54 AM"
    ],
  },
];

export const LOSS_COLUMNS = [
  { key: "ct_loss", label: "CT Loss", code: "6111" },
  { key: "start_loss", label: "Start up Loss", code: "6112" },
  { key: "mech_maintenance", label: "Mech MAINT", code: "5135" },
  { key: "elect_maintenance", label: "Elect MAINT", code: "5135" },
  { key: "reset", label: "RESET", code: "5133" },
  { key: "machine_adjustment", label: "Machine Adjustment", code: "5138" },
  { key: "supplier", label: "Supplier", code: "5131" },
  { key: "shared_operation", label: "Shared Operation", code: "5131" },
  { key: "tool", label: "Tool", code: "5134T" },
  { key: "spindle_service", label: "Spindle Service", code: "5134S" },
  { key: "wheel_change", label: "Wheel Change", code: "6113" },
  { key: "operator", label: "OPTR", code: "5137" },
  { key: "plan_stop", label: "PLAN STOP", code: "6114" },
  { key: "quality", label: "QUALITY", code: "" },
  { key: "system", label: "SYSTEM", code: "5132/5139" },
] as const;

export type LossKey = typeof LOSS_COLUMNS[number]["key"];

export interface LossDetails {
  ct_loss: number | null;
  ct_loss_reason: string;
  start_loss: number | null;
  start_loss_reason: string;
  mech_maintenance: number | null;
  mech_maintenance_reason: string;
  elect_maintenance: number | null;
  elect_maintenance_reason: string;
  reset: number | null;
  reset_reason: string;
  machine_adjustment: number | null;
  machine_adjustment_reason: string;
  supplier: number | null;
  supplier_reason: string;
  shared_operation: number | null;
  shared_operation_reason: string;
  tool: number | null;
  tool_reason: string;
  spindle_service: number | null;
  spindle_service_reason: string;
  wheel_change: number | null;
  wheel_change_reason: string;
  operator: number | null;
  operator_reason: string;
  plan_stop: number | null;
  plan_stop_reason: string;
  quality: number | null;
  quality_reason: string;
  system: number | null;
  system_reason: string;
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
  presentOperators: string;
  absentOperators: string;
  totalLossQty: number | null;
  totalLossHrs: number | null;
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
    ct_loss: null,
    ct_loss_reason: "",
    start_loss: null,
    start_loss_reason: "",
    mech_maintenance: null,
    mech_maintenance_reason: "",
    elect_maintenance: null,
    elect_maintenance_reason: "",
    reset: null,
    reset_reason: "",
    machine_adjustment: null,
    machine_adjustment_reason: "",
    supplier: null,
    supplier_reason: "",
    shared_operation: null,
    shared_operation_reason: "",
    tool: null,
    tool_reason: "",
    spindle_service: null,
    spindle_service_reason: "",
    wheel_change: null,
    wheel_change_reason: "",
    operator: null,
    operator_reason: "",
    plan_stop: null,
    plan_stop_reason: "",
    quality: null,
    quality_reason: "",
    system: null,
    system_reason: "",
  };
}

export function generateId(): string {
  return uuidv4();
}

export function createEmptyEntry(timeSlot: string): HourlyEntry {
  return {
    id: generateId(),
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
    presentOperators: "", absentOperators: "", totalLossQty: null, totalLossHrs: null,
  };
}
