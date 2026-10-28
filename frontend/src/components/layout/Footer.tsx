import React from 'react';
import { Shield, Droplets, MapPin, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#3a405a] text-[#f9dec9] border-t border-[#685044]/40 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Project Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#99b2dd] flex items-center justify-center text-[#3a405a]">
                <Droplets className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">
                Smart Community Health Surveillance
              </h3>
            </div>
            <p className="text-xs text-[#f9dec9]/80 leading-relaxed max-w-lg">
              Smart Community Health Monitoring and Early Warning System for Water-Borne Disease Prevention in Rural Communities.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#685044]/50 rounded-full text-[11px] text-[#99b2dd]">
              <MapPin className="w-3.5 h-3.5" />
              <span>Real-Time Water Quality & Disease Sentinel</span>
            </div>
          </div>

          {/* Col 2: Surveillance Scope */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#99b2dd] mb-3">
              Surveillance States
            </h4>
            <ul className="text-xs text-[#f9dec9]/75 space-y-1.5">
              <li>Assam • Brahmaputra Basin</li>
              <li>Meghalaya • Sohra & Mawlynnong</li>
              <li>Manipur • Loktak Freshwater Ring</li>
              <li>Arunachal Pradesh • Ziro Valley</li>
              <li>Nagaland • Mokokchung District</li>
              <li>Mizoram, Tripura & Sikkim</li>
            </ul>
          </div>

          {/* Col 3: Disclaimer */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#e9afa3] flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#e9afa3]" />
              Surveillance Protocol
            </h4>
            <div className="p-3 bg-[#685044]/40 rounded-xl border border-[#e9afa3]/30 text-[11px] text-[#f9dec9]/90 leading-relaxed">
              <strong>Official Disclaimer:</strong> This portal provides community-level environmental hazard warnings based on citizen reporting. It never generates clinical diagnoses or claims verified disease outbreaks without epidemiological laboratory confirmation.
            </div>
          </div>
        </div>

        <div className="border-t border-[#685044]/50 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#f9dec9]/60">
          <p>© SmartHealth NE • Community Surveillance Platform</p>
          <div className="flex gap-4 mt-2 sm:mt-0 text-[11px]">
            <span>Public Health Informatics</span>
            <span>•</span>
            <span>Water Quality Early-Warning</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
