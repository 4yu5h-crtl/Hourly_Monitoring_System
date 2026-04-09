export interface ChannelOption {
  value: string;
  label: string;
}

export interface MachineOption {
  value: string;
  label: string;
}

export const CHANNEL_OPTIONS: ChannelOption[] = [
  { value: "CH-02", label: "CH-02" },
];

const CHANNEL_MACHINE_MAP: Record<string, MachineOption[]> = {
  "CH-02": [
    { value: "ABG-1129", label: "ABG-1129" },
    { value: "CL-1063", label: "CL-1063" },
    { value: "DEMAG-C2I2", label: "DEMAG-C2I2" },
    { value: "FDT-C2I1", label: "FDT-C2I1" },
    { value: "FSF-1235-F", label: "FSF-1235-F" },
    { value: "FSF-1235-R", label: "FSF-1235-R" },
    { value: "FSF-1236-F", label: "FSF-1236-F" },
    { value: "FSF-1236-R", label: "FSF-1236-R" },
    { value: "HIT-1255", label: "HIT-1255" },
    { value: "HMV-1237", label: "HMV-1237" },
    { value: "IMP-1252", label: "IMP-1252" },
    { value: "IR-CH-2", label: "IR-CH-2" },
    { value: "IRL-864", label: "IRL-864" },
    { value: "Laser Marking CH02", label: "Laser Marking CH02" },
    { value: "MGI-C2A1", label: "MGI-C2A1" },
    { value: "MVM-1258", label: "MVM-1258" },
    { value: "MYD-1257", label: "MYD-1257" },
    { value: "OD POKAYOKE CH02", label: "OD POKAYOKE CH02" },
    { value: "OLM-C2A1", label: "OLM-C2A1" },
    { value: "OR-CH-2", label: "OR-CH-2" },
    { value: "SGB-997", label: "SGB-997" },
    { value: "SHG-1002", label: "SHG-1002" },
    { value: "SHG-840", label: "SHG-840" },
    { value: "SPC IR PY CH02", label: "SPC IR PY CH02" },
    { value: "SPC OR PY", label: "SPC OR PY" },
    { value: "SPC-1065", label: "SPC-1065" },
    { value: "SPC-1185", label: "SPC-1185" },
    { value: "SSB-1009", label: "SSB-1009" },
    { value: "SSB-1230", label: "SSB-1230" },
    { value: "TOL-1262", label: "TOL-1262" },
    { value: "WASH-1253", label: "WASH-1253" },
    { value: "XHH-1263-1", label: "XHH-1263-1" },
    { value: "XHH-1263-2", label: "XHH-1263-2" },
  ],
};

export function getMachinesForChannel(channel: string): MachineOption[] {
  return CHANNEL_MACHINE_MAP[channel] || [];
}
