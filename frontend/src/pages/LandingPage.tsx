import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { MapSpatialItem } from '../types';
import { RiskMap } from '../components/maps/RiskMap';
import {
  Droplets,
  ShieldCheck,
  Activity,
  MapPin,
  ArrowRight,
  TrendingUp,
  FlaskConical,
  Users,
  AlertTriangle,
  HeartPulse,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [mapItems, setMapItems] = useState<MapSpatialItem[]>([]);
  const [stats, setStats] = useState({
    villagesCovered: 8,
    reportsLogged: 42,
    activeAlerts: 3
  });

  useEffect(() => {
    api.get('/analytics/map-data')
      .then((res) => {
        if (res.data?.data) {
          const reports = res.data.data.reports || [];
          const waterTests = res.data.data.waterTests || [];
          setMapItems([...reports, ...waterTests]);
        }
      })
      .catch(() => {
        setMapItems([
          {
            id: 'demo-1',
            type: 'report',
            village: 'Majuli Island',
            sourceType: 'handpump',
            symptoms: ['diarrhea', 'vomiting'],
            riskLevel: 'critical',
            coordinates: [94.1848, 26.9602],
            timestamp: new Date().toISOString()
          },
          {
            id: 'demo-2',
            type: 'report',
            village: 'Sohra (Cherrapunji)',
            sourceType: 'well',
            symptoms: ['diarrhea', 'fever'],
            riskLevel: 'high',
            coordinates: [91.7323, 25.2986],
            timestamp: new Date().toISOString()
          },
          {
            id: 'demo-3',
            type: 'waterTest',
            village: 'Moirang (Loktak)',
            sourceType: 'pipeline',
            result: 'safe',
            riskLevel: 'low',
            coordinates: [93.7915, 24.5050],
            timestamp: new Date().toISOString()
          },
          {
            id: 'demo-4',
            type: 'report',
            village: 'Ziro Valley',
            sourceType: 'pond',
            symptoms: ['diarrhea', 'abdominal_pain'],
            riskLevel: 'medium',
            coordinates: [93.8344, 27.5950],
            timestamp: new Date().toISOString()
          }
        ]);
      });
  }, []);

  return (
    <div className="space-y-12 pb-16">
      {/* Modern Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#3a405a] via-[#434b6a] to-[#2c3147] text-white p-8 sm:p-14 shadow-xl">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-[#99b2dd]/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-[#e9afa3]/15 blur-3xl pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-[#99b2dd]">
            <HeartPulse className="w-4 h-4 text-[#e9afa3]" />
            <span>Community Water Safety & Early Warning Sentinel</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Protecting Rural Water, <br />
            <span className="text-[#99b2dd]">Preventing Outbreaks Early.</span>
          </h1>

          <p className="text-sm sm:text-base text-[#f9dec9]/90 font-normal leading-relaxed max-w-2xl">
            A real-time community monitoring platform. Citizens report contaminated water points and symptoms, health workers verify samples, and automated algorithms catch outbreak patterns before they spread.
          </p>

          {/* Quick Stats Pill Bar */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-md">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-center">
              <span className="text-xl sm:text-2xl font-black text-[#99b2dd] block">8+</span>
              <span className="text-[11px] text-[#f9dec9]/75 font-medium">Villages Covered</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-center">
              <span className="text-xl sm:text-2xl font-black text-[#e9afa3] block">Real-Time</span>
              <span className="text-[11px] text-[#f9dec9]/75 font-medium">GIS Map</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/10 text-center">
              <span className="text-xl sm:text-2xl font-black text-emerald-300 block">24/7</span>
              <span className="text-[11px] text-[#f9dec9]/75 font-medium">Surveillance</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Link
              to="/report-submission"
              className="px-6 py-3 rounded-xl bg-[#99b2dd] hover:bg-[#86a2d1] text-[#3a405a] text-sm font-extrabold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
            >
              <Droplets className="w-4 h-4 text-[#3a405a]" />
              Report Water Issue
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-bold backdrop-blur-sm transition-all"
            >
              Sign In to Dashboard
            </Link>
            <a
              href="#live-map"
              className="px-4 py-3 text-xs font-semibold text-[#f9dec9] hover:underline flex items-center gap-1"
            >
              View Risk Map <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* 3 Step Interactive Workflow (Clean & Visual) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-[#3a405a]">How It Works</h2>
            <p className="text-xs text-[#685044]">Three steps from community alert to clean, safe water</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white p-6 rounded-2xl border border-[#685044]/15 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#f9dec9] flex items-center justify-center text-[#3a405a] font-bold mb-4">
              <Droplets className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-[#3a405a] text-base mb-1">1. Community Reports</h3>
            <p className="text-xs text-[#685044] leading-relaxed">
              Villagers quickly log murky water, strange odors from handpumps, or family gastrointestinal symptoms with optional GPS tagging.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#685044]/15 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#e9afa3]/40 flex items-center justify-center text-[#3a405a] font-bold mb-4">
              <AlertTriangle className="w-5 h-5 text-amber-700" />
            </div>
            <h3 className="font-extrabold text-[#3a405a] text-base mb-1">2. Early Warning Trigger</h3>
            <p className="text-xs text-[#685044] leading-relaxed">
              Surveillance algorithms analyze 7-day reports. If a cluster of symptoms or water issues is detected, local health workers receive immediate alerts.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-[#685044]/15 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-10 h-10 rounded-xl bg-[#99b2dd]/30 flex items-center justify-center text-[#3a405a] font-bold mb-4">
              <FlaskConical className="w-5 h-5 text-[#3a405a]" />
            </div>
            <h3 className="font-extrabold text-[#3a405a] text-base mb-1">3. Field Action & Testing</h3>
            <p className="text-xs text-[#685044] leading-relaxed">
              Health workers inspect the source, perform water quality tests (pH, chlorine, coliform, E. coli), chlorinate wells, and resolve the hazard.
            </p>
          </div>
        </div>
      </section>

      {/* Live Geospatial Map */}
      <section id="live-map" className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-[#3a405a] flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#e9afa3]" />
              Live Water Quality & Health Map
            </h2>
            <p className="text-xs text-[#685044]">
              Real-time markers showing reported water sources and test results across regional villages
            </p>
          </div>
          <span className="text-xs text-[#3a405a] bg-white px-3 py-1 rounded-xl border border-[#685044]/20 shadow-sm font-semibold">
            Interactive GIS Pins
          </span>
        </div>

        <RiskMap items={mapItems} height="460px" />
      </section>

      {/* Quick Action Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-[#f9dec9]/60 border border-[#685044]/20 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold text-[#685044] uppercase tracking-wider">Are you a resident?</span>
            <h3 className="text-lg font-extrabold text-[#3a405a] mt-1">Suspect your water source is unsafe?</h3>
            <p className="text-xs text-[#685044] mt-1 leading-relaxed">
              It takes less than a minute to submit a report. Help your community prevent water-borne illnesses before they spread.
            </p>
          </div>
          <Link
            to="/report-submission"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3a405a] text-white hover:bg-[#2e3348] text-xs font-bold rounded-xl transition-colors w-fit"
          >
            Submit a Report <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-[#99b2dd]/25 border border-[#99b2dd]/50 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs font-bold text-[#3a405a] uppercase tracking-wider">Health Worker or Official?</span>
            <h3 className="text-lg font-extrabold text-[#3a405a] mt-1">Access the Surveillance Hub</h3>
            <p className="text-xs text-[#685044] mt-1 leading-relaxed">
              Log into your portal to review incoming complaints, update water sample results, and manage active early-warning flags.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3a405a] text-white hover:bg-[#2e3348] text-xs font-bold rounded-xl transition-colors w-fit"
          >
            Personnel Login <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
};
