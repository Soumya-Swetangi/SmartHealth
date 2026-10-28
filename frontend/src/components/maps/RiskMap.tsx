import React, { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { MapSpatialItem } from '../../types';
import { MapMarker } from './MapMarker';
import { Filter, Layers, Info } from 'lucide-react';

interface RiskMapProps {
  items: MapSpatialItem[];
  center?: [number, number]; // [lat, lng]
  zoom?: number;
  height?: string;
}

export const RiskMap: React.FC<RiskMapProps> = ({
  items,
  center = [26.2006, 92.9376], // Default Northeast India center (Assam)
  zoom = 7,
  height = '500px'
}) => {
  const [filterType, setFilterType] = useState<'all' | 'report' | 'waterTest'>('all');
  const [filterRisk, setFilterRisk] = useState<string>('all');

  const filteredItems = items.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterRisk !== 'all' && item.riskLevel !== filterRisk) return false;
    return true;
  });

  return (
    <div className="relative rounded-2xl overflow-hidden border border-[#685044]/30 shadow-md bg-white">
      {/* Top Map Control Bar */}
      <div className="p-3 bg-white/95 backdrop-blur-sm border-b border-[#685044]/15 flex flex-wrap items-center justify-between gap-3 z-20 relative">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#3a405a]" />
          <span className="text-xs font-bold text-[#3a405a]">
            Northeast GIS Epidemiological Surveillance
          </span>
          <span className="px-2 py-0.5 bg-[#99b2dd]/30 text-[#3a405a] text-[10px] font-bold rounded-full">
            {filteredItems.length} active pins
          </span>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 bg-[#f9dec9]/40 p-1 rounded-lg border border-[#685044]/20 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors ${
                filterType === 'all'
                  ? 'bg-[#3a405a] text-white shadow-sm'
                  : 'text-[#685044] hover:text-[#3a405a]'
              }`}
            >
              All Layers
            </button>
            <button
              onClick={() => setFilterType('report')}
              className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors ${
                filterType === 'report'
                  ? 'bg-[#3a405a] text-white shadow-sm'
                  : 'text-[#685044] hover:text-[#3a405a]'
              }`}
            >
              ⚠️ Symptoms
            </button>
            <button
              onClick={() => setFilterType('waterTest')}
              className={`px-2 py-1 rounded font-semibold text-[11px] transition-colors ${
                filterType === 'waterTest'
                  ? 'bg-[#3a405a] text-white shadow-sm'
                  : 'text-[#685044] hover:text-[#3a405a]'
              }`}
            >
              💧 Water Tests
            </button>
          </div>

          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="px-2.5 py-1 text-xs font-medium rounded-lg border border-[#685044]/25 bg-white text-[#3a405a] focus:outline-none focus:ring-1 focus:ring-[#99b2dd]"
          >
            <option value="all">All Risk Levels</option>
            <option value="critical">Critical Risk Only</option>
            <option value="high">High Risk Only</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Map Body */}
      <div style={{ height }}>
        <MapContainer
          center={center}
          zoom={zoom}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {filteredItems.map((item) => (
            <MapMarker key={`${item.type}-${item.id}`} item={item} />
          ))}
        </MapContainer>
      </div>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 left-4 z-20 bg-white/95 backdrop-blur-sm p-3 rounded-xl border border-[#685044]/20 shadow-lg text-[11px] text-[#3a405a] space-y-1.5 hidden sm:block">
        <p className="font-extrabold uppercase text-[10px] tracking-wider text-[#685044]">
          Surveillance Legend
        </p>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-600 inline-block shadow-sm"></span>
          <span>Critical / Unsafe Contamination</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-600 inline-block shadow-sm"></span>
          <span>High Risk Clustering</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-amber-600 inline-block shadow-sm"></span>
          <span>Medium / Borderline Test</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-emerald-600 inline-block shadow-sm"></span>
          <span>Low Risk / Safe Drinking Point</span>
        </div>
      </div>
    </div>
  );
};
