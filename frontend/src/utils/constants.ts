export interface VillageLocationItem {
  name: string;
  district: string;
  state: string;
  coordinates: [number, number]; // [longitude, latitude]
}

export const NORTHEAST_LOCATION_HIERARCHY: Record<
  string,
  Record<string, { name: string; coordinates: [number, number] }[]>
> = {
  Assam: {
    'Majuli / Jorhat': [
      { name: 'Majuli Island', coordinates: [94.1848, 26.9602] },
      { name: 'Garamur Satra', coordinates: [94.1562, 26.9715] },
      { name: 'Kamalabari Ghat', coordinates: [94.1625, 26.9321] },
      { name: 'Nimati Ghat Rural', coordinates: [94.2508, 26.8584] },
      { name: 'Titabor Block', coordinates: [94.1972, 26.5924] }
    ],
    Kamrup: [
      { name: 'Hajo Rural', coordinates: [91.5276, 26.2458] },
      { name: 'Sualkuchi Silk Village', coordinates: [91.5694, 26.1694] },
      { name: 'Boko Block', coordinates: [91.2336, 25.9765] },
      { name: 'Chaygaon Char', coordinates: [91.3852, 26.0468] },
      { name: 'Rani Community Block', coordinates: [91.6085, 26.0542] }
    ],
    Barpeta: [
      { name: 'Barpeta Road Rural', coordinates: [90.9685, 26.5012] },
      { name: 'Howly Block', coordinates: [90.9675, 26.4258] },
      { name: 'Mandia Char', coordinates: [90.9542, 26.2564] },
      { name: 'Sarthebari Village', coordinates: [91.2245, 26.3256] }
    ],
    Dhemaji: [
      { name: 'Dhemaji Rural', coordinates: [94.5828, 27.4815] },
      { name: 'Jonai Riverine Block', coordinates: [95.1612, 27.7725] },
      { name: 'Gogamukh Village', coordinates: [94.3105, 27.4251] },
      { name: 'Silapathar Char', coordinates: [94.7924, 27.5964] }
    ],
    Dibrugarh: [
      { name: 'Chabua Tea Estate Village', coordinates: [95.1745, 27.4821] },
      { name: 'Naharkatia Block', coordinates: [95.3312, 27.2856] },
      { name: 'Moranhat Rural', coordinates: [94.9215, 27.1764] },
      { name: 'Rohmaria Riverbank', coordinates: [95.0842, 27.5412] }
    ],
    'Dima Hasao': [
      { name: 'Haflong Hills', coordinates: [93.0298, 25.1764] },
      { name: 'Jatinga Village', coordinates: [93.0156, 25.1254] },
      { name: 'Umrangso Reservoir Block', coordinates: [92.7312, 25.5124] },
      { name: 'Maibang Rural', coordinates: [93.1715, 25.3025] }
    ],
    Cachar: [
      { name: 'Silchar Sadar Rural', coordinates: [92.7789, 24.8333] },
      { name: 'Lakhipur Block', coordinates: [93.0124, 24.7956] },
      { name: 'Sonai Riverine Village', coordinates: [92.8912, 24.7315] },
      { name: 'Katigorah Flood Zone', coordinates: [92.5482, 24.8924] }
    ],
    Nagaon: [
      { name: 'Kaliabor Block', coordinates: [92.9376, 26.5412] },
      { name: 'Raha Char Village', coordinates: [92.5124, 26.2315] },
      { name: 'Dhing Riverine Cluster', coordinates: [92.4756, 26.4625] },
      { name: 'Hojai Doboka Rural', coordinates: [92.8524, 26.0012] }
    ]
  },
  Meghalaya: {
    'East Khasi Hills': [
      { name: 'Sohra (Cherrapunji)', coordinates: [91.7323, 25.2986] },
      { name: 'Mawlynnong', coordinates: [91.9056, 25.2014] },
      { name: 'Mawsynram Village', coordinates: [91.5842, 25.2975] },
      { name: 'Pynursla Hill Block', coordinates: [91.8945, 25.3112] },
      { name: 'Smit Community Cluster', coordinates: [91.9012, 25.5245] }
    ],
    'West Garo Hills': [
      { name: 'Tura Rural Block', coordinates: [90.2036, 25.5142] },
      { name: 'Phulbari River Plain', coordinates: [90.0215, 25.8645] },
      { name: 'Selsella Flood Hamlet', coordinates: [90.0542, 25.6912] },
      { name: 'Dadenggre Village', coordinates: [90.2315, 25.6245] }
    ],
    'Jaintia Hills': [
      { name: 'Jowai Rural', coordinates: [92.2012, 25.4512] },
      { name: 'Dawki Umngot Riverbank', coordinates: [92.0215, 25.1856] },
      { name: 'Khliehriat Block', coordinates: [92.3645, 25.3589] },
      { name: 'Amlarem Spring Cluster', coordinates: [92.1156, 25.2845] }
    ],
    'Ri Bhoi': [
      { name: 'Nongpoh Rural', coordinates: [91.8789, 25.9024] },
      { name: 'Umiam Lake Cluster', coordinates: [91.9025, 25.6712] },
      { name: 'Byrnihat Border Village', coordinates: [91.8712, 26.0456] }
    ]
  },
  Manipur: {
    'Bishnupur / Loktak': [
      { name: 'Moirang (Loktak)', coordinates: [93.7915, 24.5050] },
      { name: 'Thanga Phumdi Island', coordinates: [93.8312, 24.5345] },
      { name: 'Nambol Rural', coordinates: [93.8415, 24.7156] },
      { name: 'Kumbi Lake Shore', coordinates: [93.8124, 24.4256] }
    ],
    'Imphal West': [
      { name: 'Lamphelpat Cluster', coordinates: [93.9125, 24.8256] },
      { name: 'Wangoi Riverine Block', coordinates: [93.8956, 24.6745] },
      { name: 'Patsoi Rural Village', coordinates: [93.8745, 24.7956] }
    ],
    'Imphal East': [
      { name: 'Porompat Rural', coordinates: [93.9645, 24.8125] },
      { name: 'Sawombung Block', coordinates: [94.0215, 24.8645] },
      { name: 'Jiribam Barak Basin', coordinates: [93.1215, 24.8012] }
    ],
    Churachandpur: [
      { name: 'Tuibong Hill Village', coordinates: [93.6985, 24.3356] },
      { name: 'Lamka Rural Cluster', coordinates: [93.6812, 24.3312] },
      { name: 'Singngat Border Block', coordinates: [93.5845, 24.1425] }
    ]
  },
  Mizoram: {
    Champhai: [
      { name: 'Champhai Border', coordinates: [93.3275, 23.4735] },
      { name: 'Zokhawthar Village', coordinates: [93.4012, 23.3645] },
      { name: 'Khawzawl Hill Block', coordinates: [93.1845, 23.5312] }
    ],
    Aizawl: [
      { name: 'Sairang Tlawng Riverbank', coordinates: [92.6512, 23.8124] },
      { name: 'Darlawn Rural Cluster', coordinates: [92.9125, 24.0156] },
      { name: 'Aibawk Spring Village', coordinates: [92.7124, 23.5645] }
    ],
    Lunglei: [
      { name: 'Tlabung Riverine Block', coordinates: [92.5012, 22.9056] },
      { name: 'Hnahthial Rural', coordinates: [92.9312, 22.9654] },
      { name: 'Lungsen Village', coordinates: [92.5845, 22.8712] }
    ],
    Kolasib: [
      { name: 'Bairabi Flood Plain', coordinates: [92.5389, 24.1845] },
      { name: 'Vairengte Foothill Village', coordinates: [92.7612, 24.5025] },
      { name: 'Kawnpui Cluster', coordinates: [92.6812, 24.0412] }
    ]
  },
  Nagaland: {
    Mokokchung: [
      { name: 'Mokokchung Village', coordinates: [94.5244, 26.3248] },
      { name: 'Ungma Heritage Village', coordinates: [94.5125, 26.3012] },
      { name: 'Tuli Valley Block', coordinates: [94.7512, 26.7012] },
      { name: 'Changtongya Cluster', coordinates: [94.6812, 26.5412] }
    ],
    Kohima: [
      { name: 'Khonoma Green Village', coordinates: [94.0215, 25.6542] },
      { name: 'Jakhama Hill Block', coordinates: [94.1245, 25.5812] },
      { name: 'Tseminyu Rural', coordinates: [94.1756, 25.9245] }
    ],
    Dimapur: [
      { name: 'Chumoukedima Foothills', coordinates: [93.7845, 25.8012] },
      { name: 'Medziphema Block', coordinates: [93.8712, 25.7545] },
      { name: 'Dhansiripar Flood Plain', coordinates: [93.7125, 25.7812] }
    ],
    Wokha: [
      { name: 'Doyang Reservoir Village', coordinates: [94.2612, 26.2156] },
      { name: 'Bhandari Foothill Block', coordinates: [94.1125, 26.3312] }
    ]
  },
  Tripura: {
    'West Tripura': [
      { name: 'Jirania Rural Block', coordinates: [91.4312, 23.8156] },
      { name: 'Mohanpur Village', coordinates: [91.3756, 23.9645] },
      { name: 'Dukli Haora Riverbank', coordinates: [91.2845, 23.8012] }
    ],
    Dhalai: [
      { name: 'Ambassa Forest Block', coordinates: [91.8545, 23.9212] },
      { name: 'Kamalpur Dhalai Basin', coordinates: [91.8312, 24.1956] },
      { name: 'Manu Riverine Cluster', coordinates: [91.9712, 23.9945] }
    ],
    'North Tripura': [
      { name: 'Dharmanagar Juri Basin', coordinates: [92.1645, 24.3712] },
      { name: 'Kanchanpur Jampui Hills', coordinates: [92.2145, 24.0412] },
      { name: 'Panisagar Block', coordinates: [92.1412, 24.2612] }
    ],
    'South Tripura': [
      { name: 'Sabroom Feni Riverbank', coordinates: [91.7145, 23.0012] },
      { name: 'Belonia Muhuri Basin', coordinates: [91.4512, 23.2512] }
    ]
  },
  'Arunachal Pradesh': {
    'Lower Subansiri': [
      { name: 'Ziro Valley', coordinates: [93.8344, 27.5950] },
      { name: 'Hapoli Apatani Cluster', coordinates: [93.8412, 27.5456] },
      { name: 'Hong Heritage Village', coordinates: [93.8612, 27.5712] }
    ],
    'Papum Pare': [
      { name: 'Doimukh Dikrong Basin', coordinates: [93.7512, 27.1456] },
      { name: 'Yupia Rural Block', coordinates: [93.7124, 27.1412] },
      { name: 'Banderdewa Foothills', coordinates: [93.8245, 27.1056] }
    ],
    'East Siang': [
      { name: 'Pasighat Siang Riverbank', coordinates: [95.3312, 28.0645] },
      { name: 'Mebo Flood Cluster', coordinates: [95.4215, 28.1125] },
      { name: 'Ruksin Foothill Village', coordinates: [95.1845, 27.8612] }
    ],
    Tawang: [
      { name: 'Lumla Mountain Stream Block', coordinates: [91.7125, 27.5312] },
      { name: 'Jang Waterfall Hamlet', coordinates: [91.9812, 27.5812] }
    ]
  },
  Sikkim: {
    'East Sikkim': [
      { name: 'Rangpo Teesta Basin', coordinates: [88.5312, 27.1756] },
      { name: 'Singtam Riverine Cluster', coordinates: [88.5012, 27.2312] },
      { name: 'Pakyong Spring Block', coordinates: [88.5912, 27.2412] }
    ],
    'West Sikkim': [
      { name: 'Gyalshing Rural', coordinates: [88.2545, 27.2895] },
      { name: 'Yuksom Mountain Spring', coordinates: [88.2215, 27.3712] },
      { name: 'Soreng Hill Cluster', coordinates: [88.2012, 27.1712] }
    ],
    'South Sikkim': [
      { name: 'Namchi Rural Block', coordinates: [88.3612, 27.1656] },
      { name: 'Melli Teesta Confluence', coordinates: [88.4545, 27.0895] }
    ],
    'North Sikkim': [
      { name: 'Mangan Teesta Valley', coordinates: [88.5312, 27.5012] },
      { name: 'Chungthang Confluence', coordinates: [88.6456, 27.6056] }
    ]
  }
};

export const NORTHEAST_VILLAGES_LIST: VillageLocationItem[] = Object.entries(
  NORTHEAST_LOCATION_HIERARCHY
).flatMap(([state, districtsObj]) =>
  Object.entries(districtsObj).flatMap(([district, villages]) =>
    villages.map((v) => ({
      name: v.name,
      district,
      state,
      coordinates: v.coordinates
    }))
  )
);

export function findVillageHierarchy(villageName?: string): {
  state: string;
  district: string;
  village: string;
  coordinates: [number, number];
} {
  const matched = NORTHEAST_VILLAGES_LIST.find((v) => v.name === villageName);
  if (matched) {
    return {
      state: matched.state,
      district: matched.district,
      village: matched.name,
      coordinates: matched.coordinates
    };
  }
  const fallback = NORTHEAST_VILLAGES_LIST[0];
  return {
    state: fallback.state,
    district: fallback.district,
    village: villageName || fallback.name,
    coordinates: fallback.coordinates
  };
}

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
