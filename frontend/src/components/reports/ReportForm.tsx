import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportSchema, ReportFormData } from '../../utils/validators';
import { NORTHEAST_VILLAGES_LIST, WATER_SOURCE_TYPES, SYMPTOMS_LIST } from '../../utils/constants';
import { reportService } from '../../services/reportService';
import { Button } from '../common/Button';
import { MapPin, AlertCircle, CheckCircle2, Navigation } from 'lucide-react';

interface ReportFormProps {
  onSubmitSuccess?: () => void;
  defaultVillage?: string;
}

export const ReportForm: React.FC<ReportFormProps> = ({
  onSubmitSuccess,
  defaultVillage = ''
}) => {
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
      village: defaultVillage || NORTHEAST_VILLAGES_LIST[0].name,
      sourceType: 'handpump',
      symptoms: ['diarrhea'],
      description: ''
    }
  });

  const selectedSymptoms = watch('symptoms') || [];

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
      (err) => {
        setGpsLoading(false);
        // Fallback to village default coordinates
        const v = NORTHEAST_VILLAGES_LIST.find((v) => v.name === watch('village')) || NORTHEAST_VILLAGES_LIST[0];
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
      const vObj = NORTHEAST_VILLAGES_LIST.find((v) => v.name === data.village);
      const coords: [number, number] = data.longitude && data.latitude
        ? [data.longitude, data.latitude]
        : vObj
        ? vObj.coordinates
        : [92.9376, 26.2006];

      await reportService.submitReport({
        village: data.village,
        sourceType: data.sourceType,
        symptoms: data.symptoms,
        description: data.description,
        location: {
          type: 'Point',
          coordinates: coords
        }
      });

      setSuccessMsg(
        'Your report has been logged into the regional early-warning surveillance engine. Health workers have been notified.'
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
          Provide observations about contaminated drinking points or community gastrointestinal symptoms in your village.
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

      {/* Village selection */}
      <div>
        <label className="block text-xs font-bold text-[#3a405a] uppercase tracking-wider mb-1">
          Village / Community
        </label>
        <select
          {...register('village')}
          className="w-full px-3.5 py-2.5 rounded-lg border border-[#685044]/30 text-sm text-[#3a405a] bg-white focus:outline-none focus:ring-2 focus:ring-[#99b2dd]"
        >
          {NORTHEAST_VILLAGES_LIST.map((v) => (
            <option key={v.name} value={v.name}>
              {v.name} ({v.state})
            </option>
          ))}
        </select>
        {errors.village && (
          <p className="text-xs text-rose-600 mt-1">{errors.village.message}</p>
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
              : 'Auto-defaults to chosen village coordinates or capture live GPS.'}
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
