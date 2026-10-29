import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportSchema, ReportFormData } from '../../utils/validators';
import {
  NORTHEAST_LOCATION_HIERARCHY,
  NORTHEAST_VILLAGES_LIST,
  findVillageHierarchy,
  WATER_SOURCE_TYPES,
  SYMPTOMS_LIST
} from '../../utils/constants';
import { reportService } from '../../services/reportService';
import { Button } from '../common/Button';
import { MapPin, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';

interface ReportFormProps {
  onSubmitSuccess?: () => void;
  defaultVillage?: string;
}

const NE_STATES = Object.keys(NORTHEAST_LOCATION_HIERARCHY);

export const ReportForm: React.FC<ReportFormProps> = ({
  onSubmitSuccess,
  defaultVillage = ''
}) => {
  const initialHierarchy = findVillageHierarchy(defaultVillage);

  const [selectedState, setSelectedState] = useState<string>(initialHierarchy.state);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(initialHierarchy.district);
  const [isCustomVillage, setIsCustomVillage] = useState<boolean>(false);
  const [customVillageName, setCustomVillageName] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [detectedLocation, setDetectedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      village: initialHierarchy.village,
      sourceType: 'handpump',
      symptoms: ['diarrhea'],
      description: ''
    }
  });

  const districtsForState = Object.keys(NORTHEAST_LOCATION_HIERARCHY[selectedState] || {});
  const villagesForDistrict =
    NORTHEAST_LOCATION_HIERARCHY[selectedState]?.[selectedDistrict] || [];

  const selectedSymptoms = watch('symptoms') || [];
  const currentVillage = watch('village');

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const firstDistrict = Object.keys(NORTHEAST_LOCATION_HIERARCHY[newState] || {})[0] || '';
    setSelectedDistrict(firstDistrict);
    const firstVillage =
      NORTHEAST_LOCATION_HIERARCHY[newState]?.[firstDistrict]?.[0]?.name || '';
    setIsCustomVillage(false);
    setCustomVillageName('');
    setValue('village', firstVillage, { shouldValidate: true });
  };

  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    const firstVillage =
      NORTHEAST_LOCATION_HIERARCHY[selectedState]?.[newDistrict]?.[0]?.name || '';
    setIsCustomVillage(false);
    setCustomVillageName('');
    setValue('village', firstVillage, { shouldValidate: true });
  };

  const handleVillageSelectChange = (val: string) => {
    if (val === '__custom__') {
      setIsCustomVillage(true);
      setValue('village', customVillageName || '', { shouldValidate: true });
    } else {
      setIsCustomVillage(false);
      setCustomVillageName('');
      setValue('village', val, { shouldValidate: true });
    }
  };

  const handleSymptomToggle = (symptomId: string) => {
    const exists = selectedSymptoms.includes(symptomId);
    if (exists) {
      setValue(
        'symptoms',
        selectedSymptoms.filter((s) => s !== symptomId),
        { shouldValidate: true }
      );
    } else {
      setValue('symptoms', [...selectedSymptoms, symptomId], { shouldValidate: true });
    }
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser.');
      return;
    }
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        setDetectedLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setValue('latitude', pos.coords.latitude);
        setValue('longitude', pos.coords.longitude);
      },
      () => {
        setGpsLoading(false);
        const v =
          NORTHEAST_VILLAGES_LIST.find((item) => item.name === watch('village')) ||
          villagesForDistrict[0] ||
          NORTHEAST_VILLAGES_LIST[0];
        setDetectedLocation({
          lat: v.coordinates[1],
          lng: v.coordinates[0]
        });
        setValue('latitude', v.coordinates[1]);
        setValue('longitude', v.coordinates[0]);
      },
      { timeout: 7000 }
    );
  };

  const onFormSubmit = async (data: ReportFormData) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const vObj =
        NORTHEAST_VILLAGES_LIST.find((v) => v.name === data.village) ||
        villagesForDistrict[0];
      const coords: [number, number] =
        data.longitude && data.latitude
          ? [data.longitude, data.latitude]
          : vObj
          ? vObj.coordinates
          : [92.9376, 26.2006];

      await reportService.submitReport({
        village: data.village.trim(),
        sourceType: data.sourceType,
        symptoms: data.symptoms,
        description: data.description,
        location: {
          type: 'Point',
          coordinates: coords
        }
      });

      setSuccessMsg(
        `Your report for ${data.village} (${selectedDistrict}, ${selectedState}) has been logged into the regional early-warning surveillance engine. Health workers have been notified.`
      );
      reset();
      if (onSubmitSuccess) {
        setTimeout(onSubmitSuccess, 1800);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="bg-white rounded-2xl p-6 border border-[#685044]/20 shadow-md space-y-6"
    >
      <div className="border-b border-[#685044]/15 pb-4">
        <h3 className="text-base font-extrabold text-[#3a405a]">
          Report Suspected Water Hazard or Illness
        </h3>
        <p className="text-xs text-[#685044] mt-1">
          Select your State, District, and Village below to report contaminated drinking points or community gastrointestinal symptoms.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2.5 text-xs text-rose-900">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Hierarchical Location Selector: State -> District -> Village */}
      <div className="p-4 bg-[#f9dec9]/30 rounded-2xl border border-[#685044]/20 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-extrabold text-[#3a405a] uppercase tracking-wider flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-[#3a405a]" />
            Location Hierarchy (State → District → Village)
          </span>
          <span className="text-[11px] font-semibold text-[#685044]">
            {selectedState} • {selectedDistrict}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* 1. State Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-[#3a405a] uppercase tracking-wider mb-1">
              1. State
            </label>
            <select
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#685044]/30 text-sm text-[#3a405a] bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#99b2dd]"
            >
              {NE_STATES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>

          {/* 2. District Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-[#3a405a] uppercase tracking-wider mb-1">
              2. District
            </label>
            <select
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#685044]/30 text-sm text-[#3a405a] bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#99b2dd]"
            >
              {districtsForState.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Village Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-[#3a405a] uppercase tracking-wider mb-1">
              3. Village / Community
            </label>
            <select
              value={isCustomVillage ? '__custom__' : currentVillage}
              onChange={(e) => handleVillageSelectChange(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg border border-[#685044]/30 text-sm text-[#3a405a] bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-[#99b2dd]"
            >
              {villagesForDistrict.map((v) => (
                <option key={v.name} value={v.name}>
                  {v.name}
                </option>
              ))}
              <option value="__custom__">+ Other / Enter Village Name...</option>
            </select>
          </div>
        </div>

        {/* Optional Custom Village Input if citizen selects "+ Other / Enter Village Name..." */}
        {isCustomVillage && (
          <div>
            <label className="block text-xs font-bold text-[#3a405a] mb-1">
              Enter Your Village / Hamlet Name in {selectedDistrict}, {selectedState}
            </label>
            <input
              type="text"
              value={customVillageName}
              onChange={(e) => {
                setCustomVillageName(e.target.value);
                setValue('village', e.target.value, { shouldValidate: true });
              }}
              placeholder={`e.g. Upper Hamlet, ${selectedDistrict}`}
              className="w-full px-3.5 py-2 rounded-lg border border-[#685044]/30 text-sm text-[#3a405a] bg-white focus:outline-none focus:ring-2 focus:ring-[#99b2dd]"
            />
          </div>
        )}

        {errors.village && (
          <p className="text-xs text-rose-600">{errors.village.message}</p>
        )}
      </div>

      {/* Water Source Type */}
      <div>
        <label className="block text-xs font-bold text-[#3a405a] uppercase tracking-wider mb-1">
          Suspected Water Source
        </label>
        <select
          {...register('sourceType')}
          className="w-full px-3.5 py-2.5 rounded-lg border border-[#685044]/30 text-sm text-[#3a405a] bg-white focus:outline-none focus:ring-2 focus:ring-[#99b2dd]"
        >
          {WATER_SOURCE_TYPES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        {errors.sourceType && (
          <p className="text-xs text-rose-600 mt-1">{errors.sourceType.message}</p>
        )}
      </div>

      {/* Symptoms multi-selection */}
      <div>
        <label className="block text-xs font-bold text-[#3a405a] uppercase tracking-wider mb-2">
          Observed Symptoms (Select all that apply)
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {SYMPTOMS_LIST.map((sym) => {
            const isChecked = selectedSymptoms.includes(sym.id);
            return (
              <button
                type="button"
                key={sym.id}
                onClick={() => handleSymptomToggle(sym.id)}
                className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs font-semibold transition-all ${
                  isChecked
                    ? 'bg-[#99b2dd]/20 border-[#3a405a] text-[#3a405a] shadow-sm'
                    : 'bg-white border-[#685044]/20 text-[#685044] hover:bg-[#f9dec9]/30'
                }`}
              >
                <span>{sym.label}</span>
                <span
                  className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                    isChecked
                      ? 'bg-[#3a405a] text-white border-[#3a405a]'
                      : 'border-[#685044]/40 bg-white'
                  }`}
                >
                  {isChecked && '✓'}
                </span>
              </button>
            );
          })}
        </div>
        {errors.symptoms && (
          <p className="text-xs text-rose-600 mt-1.5">{errors.symptoms.message}</p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-bold text-[#3a405a] uppercase tracking-wider mb-1">
          Detailed Description or Water Appearance (Optional)
        </label>
        <textarea
          {...register('description')}
          rows={3}
          placeholder="e.g. Muddy smell, rust color from handpump, sudden loose motion in 3 neighboring families..."
          className="w-full px-3.5 py-2.5 rounded-lg border border-[#685044]/30 text-sm text-[#3a405a] placeholder-[#685044]/50 focus:outline-none focus:ring-2 focus:ring-[#99b2dd]"
        />
        {errors.description && (
          <p className="text-xs text-rose-600 mt-1">{errors.description.message}</p>
        )}
      </div>

      {/* GPS Geo-Tagging option */}
      <div className="p-3.5 bg-[#f9dec9]/40 rounded-xl border border-[#685044]/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#3a405a]">
            <MapPin className="w-4 h-4 text-[#e9afa3]" />
            <span>Geographic Coordinate Pinning</span>
          </div>
          <p className="text-[11px] text-[#685044] mt-0.5">
            {detectedLocation
              ? `GPS Captured: Lat ${detectedLocation.lat.toFixed(4)}, Lng ${detectedLocation.lng.toFixed(4)}`
              : `Auto-defaults to ${currentVillage || selectedDistrict} coordinates (${selectedState}) or capture live GPS.`}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={gpsLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#685044]/25 text-[#3a405a] text-xs font-bold rounded-lg hover:bg-[#99b2dd]/20 transition-colors"
        >
          <Navigation className={`w-3.5 h-3.5 ${gpsLoading ? 'animate-spin' : ''}`} />
          {gpsLoading ? 'Detecting...' : 'Pin Live GPS'}
        </button>
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isSubmitting}
        className="w-full font-bold shadow-md"
      >
        Submit Community Report
      </Button>
    </form>
  );
};
