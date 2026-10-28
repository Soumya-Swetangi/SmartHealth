export const NORTHEAST_VILLAGES_LIST = [
  { name: 'Majuli Island', state: 'Assam', coordinates: [94.1848, 26.9602] as [number, number] },
  { name: 'Sohra (Cherrapunji)', state: 'Meghalaya', coordinates: [91.7323, 25.2986] as [number, number] },
  { name: 'Mawlynnong', state: 'Meghalaya', coordinates: [91.9056, 25.2014] as [number, number] },
  { name: 'Moirang (Loktak)', state: 'Manipur', coordinates: [93.7915, 24.5050] as [number, number] },
  { name: 'Ziro Valley', state: 'Arunachal Pradesh', coordinates: [93.8344, 27.5950] as [number, number] },
  { name: 'Mokokchung Village', state: 'Nagaland', coordinates: [94.5244, 26.3248] as [number, number] },
  { name: 'Haflong Hills', state: 'Assam', coordinates: [93.0298, 25.1764] as [number, number] },
  { name: 'Champhai Border', state: 'Mizoram', coordinates: [93.3275, 23.4735] as [number, number] },
  { name: 'Dhemaji Rural', state: 'Assam', coordinates: [94.5828, 27.4815] as [number, number] }
];

export const WATER_SOURCE_TYPES = [
  { value: 'handpump', label: 'Handpump / Borewell' },
  { value: 'well', label: 'Open Dug Well' },
  { value: 'river', label: 'River / Stream' },
  { value: 'pond', label: 'Community Pond / Pokhari' },
  { value: 'pipeline', label: 'Piped Water Supply' },
  { value: 'other', label: 'Other Source' }
];

export const SYMPTOMS_LIST = [
  { id: 'diarrhea', label: 'Acute Diarrhea / Loose Stools', highRisk: true },
  { id: 'vomiting', label: 'Vomiting / Nausea', highRisk: true },
  { id: 'fever', label: 'Fever / Chills', highRisk: false },
  { id: 'abdominal_pain', label: 'Severe Abdominal Cramps', highRisk: false },
  { id: 'dehydration', label: 'Severe Dehydration / Dry Mouth', highRisk: true }
];

export const RISK_COLOR_MAP = {
  low: {
    bg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-300',
    hex: '#10b981'
  },
  medium: {
    bg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-300',
    hex: '#f59e0b'
  },
  high: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-300',
    hex: '#f97316'
  },
  critical: {
    bg: 'bg-rose-100',
    text: 'text-rose-800',
    border: 'border-rose-400',
    hex: '#e11d48'
  }
};
