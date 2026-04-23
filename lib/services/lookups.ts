type LookupItem = {
  value: string;
  label: string;
};

const POSITION_ITEMS: LookupItem[] = [
  { value: "GOALKEEPER", label: "Goalkeeper" },
  { value: "DEFENDER", label: "Defender" },
  { value: "MIDFIELDER", label: "Midfielder" },
  { value: "FORWARD", label: "Forward" },
];

const PREFERRED_FOOT_ITEMS: LookupItem[] = [
  { value: "LEFT", label: "Left" },
  { value: "RIGHT", label: "Right" },
  { value: "BOTH", label: "Both" },
];

const TRANSFER_TYPE_ITEMS: LookupItem[] = [
  { value: "PERMANENT", label: "Permanent" },
  { value: "LOAN", label: "Loan" },
  { value: "FREE", label: "Free" },
];

const TRANSFER_RUMOR_STATUS_ITEMS: LookupItem[] = [
  { value: "Active", label: "Active" },
  { value: "Confirmed", label: "Confirmed" },
  { value: "Denied", label: "Denied" },
  { value: "Expired", label: "Expired" },
];

const TRANSFER_RUMOR_CREDIBILITY_ITEMS: LookupItem[] = [
  { value: "Low", label: "Low" },
  { value: "Medium", label: "Medium" },
  { value: "High", label: "High" },
];

const TRANSFER_RUMOR_TYPE_ITEMS: LookupItem[] = [
  { value: "Transfer", label: "Transfer" },
  { value: "Loan", label: "Loan" },
  { value: "Swap", label: "Swap" },
];

export function getPositionsLookup() {
  return POSITION_ITEMS;
}

export function getPreferredFootLookup() {
  return PREFERRED_FOOT_ITEMS;
}

export function getTransferTypesLookup() {
  return TRANSFER_TYPE_ITEMS;
}

export function getTransferRumorStatusesLookup() {
  return TRANSFER_RUMOR_STATUS_ITEMS;
}

export function getTransferRumorCredibilityLookup() {
  return TRANSFER_RUMOR_CREDIBILITY_ITEMS;
}

export function getTransferRumorTypesLookup() {
  return TRANSFER_RUMOR_TYPE_ITEMS;
}
