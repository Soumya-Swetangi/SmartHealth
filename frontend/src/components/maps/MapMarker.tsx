import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { MapSpatialItem } from '../../types';
import { formatDateTime } from '../../utils/formatters';

interface MapMarkerProps {
  item: MapSpatialItem;
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'critical':
      return '#e11d48'; // rose-600
    case 'high':
      return '#ea580c'; // orange-600
    case 'medium':
      return '#d97706'; // amber-600
    case 'low':
    default:
      return '#059669'; // emerald-600
  }
};

const createRiskIcon = (risk: string, isWaterTest: boolean) => {
  const color = getRiskColor(risk);
  const symbol = isWaterTest ? '💧' : '⚠️';

  return L.divIcon({
    className: 'custom-leaflet-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3);
        font-size: 14px;
        cursor: pointer;
        transition: transform 0.2s;
      ">
        <span>${symbol}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18]
  });
};

export const MapMarker: React.FC<MapMarkerProps> = ({ item }) => {
  // item.coordinates is [longitude, latitude] in GeoJSON format
  // Leaflet expects [latitude, longitude]
  const position: [number, number] = [
    item.coordinates[1],
    item.coordinates[0]
  ];

  const icon = createRiskIcon(item.riskLevel, item.type === 'waterTest');

  return (
    <Marker position={position} icon={icon}>
      <Popup className="custom-risk-popup">
        <div className="p-1 max-w-xs text-xs text-[#3a405a]">
          <div className="flex items-center justify-between pb-1.5 border-b border-[#685044]/20 mb-2">
            <span className="font-extrabold text-sm">{item.village}</span>
            <span
              className={`px-2 py-0.5 rounded-full font-bold uppercase text-[9px] ${
                item.riskLevel === 'critical'
                  ? 'bg-rose-100 text-rose-800'
                  : item.riskLevel === 'high'
                  ? 'bg-orange-100 text-orange-800'
                  : item.riskLevel === 'medium'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {item.riskLevel} Risk
            </span>
          </div>

          <div className="space-y-1">
            <p>
              <strong className="text-[#685044]">Type:</strong>{' '}
              {item.type === 'waterTest' ? 'Field Water Test' : 'Community Symptom Report'}
            </p>
            <p>
              <strong className="text-[#685044]">Source:</strong>{' '}
              <span className="capitalize">{item.sourceType}</span>
            </p>

            {item.symptoms && item.symptoms.length > 0 && (
              <p>
                <strong className="text-[#685044]">Reported Symptoms:</strong>{' '}
                <span className="capitalize">{item.symptoms.join(', ')}</span>
              </p>
            )}

            {item.result && (
              <p>
                <strong className="text-[#685044]">Laboratory Result:</strong>{' '}
                <span
                  className={`font-bold uppercase ${
                    item.result === 'unsafe'
                      ? 'text-rose-600'
                      : item.result === 'borderline'
                      ? 'text-amber-600'
                      : 'text-emerald-600'
                  }`}
                >
                  {item.result}
                </span>
              </p>
            )}

            {item.description && (
              <p className="text-[11px] text-[#685044] italic bg-[#f9dec9]/30 p-1.5 rounded">
                "{item.description}"
              </p>
            )}

            <p className="text-[10px] text-[#685044]/70 pt-1">
              Logged: {formatDateTime(item.timestamp)}
            </p>
          </div>

          <div className="mt-2 pt-1 border-t border-[#685044]/10 text-[9px] text-[#685044] font-medium">
            ⚠️ Surveillance indicator: Unverified field report
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
