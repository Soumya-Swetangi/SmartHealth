import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { waterTestService } from '../services/waterTestService';
import { WaterTest, WaterTestResult } from '../types';
import { waterTestSchema, WaterTestFormData } from '../utils/validators';
import {
  NORTHEAST_LOCATION_HIERARCHY,
  NORTHEAST_VILLAGES_LIST,
  WATER_SOURCE_TYPES
} from '../utils/constants';
import { formatDateTime } from '../utils/formatters';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Pagination } from '../components/common/Pagination';
import {
  FlaskConical,
  PlusCircle,
  Filter,
  CheckCircle,
  AlertOctagon,
  HelpCircle,
  Calendar,
  User
} from 'lucide-react';

export const WaterTestPage: React.FC = () => {
  const [tests, setTests] = useState<WaterTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterResult, setFilterResult] = useState('');
  const [filterVillage, setFilterVillage] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const neStates = Object.keys(NORTHEAST_LOCATION_HIERARCHY);
  const [modalState, setModalState] = useState<string>(neStates[0]);
  const [modalDistrict, setModalDistrict] = useState<string>(
    Object.keys(NORTHEAST_LOCATION_HIERARCHY[neStates[0]])[0]
  );

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<WaterTestFormData>({
    resolver: zodResolver(waterTestSchema),
    defaultValues: {
      village: NORTHEAST_VILLAGES_LIST[0].name,
      sourceType: 'handpump',
      result: 'unsafe',
      pH: 6.5,
      turbidity: 5.0,
      chlorine: 0.1,
      coliform: true,
      ecoli: true,
      notes: ''
    }
  });

  const modalDistricts = Object.keys(NORTHEAST_LOCATION_HIERARCHY[modalState] || {});
  const modalVillages = NORTHEAST_LOCATION_HIERARCHY[modalState]?.[modalDistrict] || [];
  const selectedModalVillage = watch('village');

  const handleModalStateChange = (newState: string) => {
    setModalState(newState);
    const firstDist = Object.keys(NORTHEAST_LOCATION_HIERARCHY[newState] || {})[0] || '';
    setModalDistrict(firstDist);
    const firstVil = NORTHEAST_LOCATION_HIERARCHY[newState]?.[firstDist]?.[0]?.name || '';
    setValue('village', firstVil, { shouldValidate: true });
  };

  const handleModalDistrictChange = (newDist: string) => {
    setModalDistrict(newDist);
    const firstVil = NORTHEAST_LOCATION_HIERARCHY[modalState]?.[newDist]?.[0]?.name || '';
    setValue('village', firstVil, { shouldValidate: true });
  };

  const loadWaterTests = async () => {
    setLoading(true);
    try {
      const res = await waterTestService.getWaterTests({
        village: filterVillage || undefined,
        result: filterResult || undefined,
        page,
        limit: 8
      });
      setTests(res.data || []);
      if (res.pagination) {
        setTotalPages(res.pagination.pages);
        setTotalItems(res.pagination.total);
      }
    } catch (err) {
      console.error('Failed to load water tests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWaterTests();
  }, [page, filterResult, filterVillage]);

  const onRecordSubmit = async (data: WaterTestFormData) => {
    try {
      await waterTestService.createWaterTest(data);
      reset();
      setIsModalOpen(false);
      loadWaterTests();
    } catch (err) {
      alert('Failed to save water test');
    }
  };

  const getResultBadge = (result: WaterTestResult) => {
    switch (result) {
      case 'safe':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'unsafe':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'borderline':
      default:
        return 'bg-amber-100 text-amber-800 border-amber-300';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#685044]/20 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#99b2dd]/30 text-[#3a405a] text-xs font-bold rounded-full mb-1">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Water Quality Field Surveillance</span>
          </div>
          <h1 className="text-2xl font-black text-[#3a405a]">
            Laboratory & Field Water Quality Records
          </h1>
          <p className="text-xs text-[#685044] mt-1 max-w-xl">
            Biological & chemical parameter results for drinking points across Northeast India.
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 font-bold shadow-md"
        >
          <PlusCircle className="w-4 h-4 text-[#99b2dd]" />
          Record New Test
        </Button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#685044]/20 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#685044]" />
          <span className="text-xs font-bold text-[#3a405a]">Filter Records:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={filterVillage}
            onChange={(e) => {
              setFilterVillage(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
          >
            <option value="">All Monitored Villages</option>
            {NORTHEAST_VILLAGES_LIST.map((v) => (
              <option key={v.name} value={v.name}>
                {v.name}
              </option>
            ))}
          </select>

          <select
            value={filterResult}
            onChange={(e) => {
              setFilterResult(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
          >
            <option value="">All Test Results</option>
            <option value="unsafe">Unsafe (Contaminated)</option>
            <option value="borderline">Borderline / Caution</option>
            <option value="safe">Safe (Permissible)</option>
          </select>
        </div>
      </div>

      {/* Tests Table / List */}
      <div className="bg-white rounded-3xl border border-[#685044]/20 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner size="md" label="Loading water test assays..." />
        ) : tests.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#685044]">
            <FlaskConical className="w-10 h-10 text-[#685044]/40 mx-auto mb-2" />
            <p className="font-bold text-sm text-[#3a405a]">No Water Test Records Found</p>
            <p className="text-[11px] mt-1">Try adjusting the filter criteria or record a new test.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#685044]/15">
            {tests.map((test) => {
              const testerName =
                typeof test.testedBy === 'object' && test.testedBy?.name
                  ? test.testedBy.name
                  : 'Health Inspector';

              return (
                <div
                  key={test._id}
                  className="p-5 hover:bg-[#f9dec9]/20 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-extrabold text-sm text-[#3a405a]">
                        {test.village}
                      </span>
                      <span className="text-xs text-[#685044] capitalize bg-[#99b2dd]/20 px-2 py-0.5 rounded font-semibold">
                        Source: {test.sourceType}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${getResultBadge(
                          test.result
                        )}`}
                      >
                        {test.result}
                      </span>
                    </div>

                    {/* Parameters tags */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                      {test.parameters?.pH !== undefined && (
                        <span className="bg-[#f9dec9]/50 px-2 py-0.5 rounded border border-[#685044]/15 text-[#3a405a] font-medium">
                          pH: <strong>{test.parameters.pH}</strong>
                        </span>
                      )}
                      {test.parameters?.turbidity !== undefined && (
                        <span className="bg-[#f9dec9]/50 px-2 py-0.5 rounded border border-[#685044]/15 text-[#3a405a] font-medium">
                          Turbidity: <strong>{test.parameters.turbidity} NTU</strong>
                        </span>
                      )}
                      {test.parameters?.chlorine !== undefined && (
                        <span className="bg-[#f9dec9]/50 px-2 py-0.5 rounded border border-[#685044]/15 text-[#3a405a] font-medium">
                          Chlorine: <strong>{test.parameters.chlorine} mg/L</strong>
                        </span>
                      )}
                      {test.parameters?.coliform && (
                        <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold border border-rose-300">
                          Coliform Positive
                        </span>
                      )}
                      {test.parameters?.ecoli && (
                        <span className="bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-bold border border-rose-300">
                          E. coli Detected
                        </span>
                      )}
                    </div>

                    {test.notes && (
                      <p className="text-xs text-[#685044] bg-[#f9dec9]/20 p-2 rounded-lg border border-[#685044]/10 mt-1">
                        {test.notes}
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-[11px] text-[#685044]/75 pt-1">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateTime(test.testDate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Tested by: {testerName}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={setPage}
          totalItems={totalItems}
        />
      </div>

      {/* Record Water Test Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Field / Lab Water Quality Test"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit(onRecordSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-[#f9dec9]/30 rounded-xl border border-[#685044]/20">
            <div>
              <label className="block text-[11px] font-bold text-[#3a405a] uppercase mb-1">
                1. State
              </label>
              <select
                value={modalState}
                onChange={(e) => handleModalStateChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
              >
                {neStates.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#3a405a] uppercase mb-1">
                2. District
              </label>
              <select
                value={modalDistrict}
                onChange={(e) => handleModalDistrictChange(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
              >
                {modalDistricts.map((dist) => (
                  <option key={dist} value={dist}>
                    {dist}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#3a405a] uppercase mb-1">
                3. Village
              </label>
              <select
                value={selectedModalVillage}
                onChange={(e) => setValue('village', e.target.value, { shouldValidate: true })}
                className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
              >
                {modalVillages.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3a405a] uppercase mb-1">
              Source Type
            </label>
            <select
              {...register('sourceType')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
            >
              {WATER_SOURCE_TYPES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3a405a] uppercase mb-1">
              Overall Test Outcome
            </label>
            <select
              {...register('result')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a] font-bold"
            >
              <option value="safe">Safe (Meets Potable Standards)</option>
              <option value="borderline">Borderline (Requires Disinfection)</option>
              <option value="unsafe">Unsafe (High Microbial/Contaminant Risk)</option>
            </select>
          </div>

          {/* Parameters Inputs */}
          <div className="p-3 bg-[#f9dec9]/30 rounded-xl border border-[#685044]/20 space-y-3">
            <p className="text-xs font-bold text-[#3a405a]">Field Assay Parameters</p>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="pH (0 - 14)"
                type="number"
                step="0.1"
                placeholder="7.0"
                {...register('pH', { valueAsNumber: true })}
              />
              <Input
                label="Turbidity (NTU)"
                type="number"
                step="0.1"
                placeholder="2.5"
                {...register('turbidity', { valueAsNumber: true })}
              />
              <Input
                label="Free Chlorine"
                type="number"
                step="0.05"
                placeholder="0.2"
                {...register('chlorine', { valueAsNumber: true })}
              />
            </div>

            <div className="flex gap-4 pt-1">
              <label className="flex items-center gap-2 text-xs font-semibold text-[#3a405a] cursor-pointer">
                <input
                  type="checkbox"
                  {...register('coliform')}
                  className="rounded border-[#685044]/40 text-[#3a405a] focus:ring-[#99b2dd]"
                />
                Total Coliform Positive
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-[#3a405a] cursor-pointer">
                <input
                  type="checkbox"
                  {...register('ecoli')}
                  className="rounded border-[#685044]/40 text-[#3a405a] focus:ring-[#99b2dd]"
                />
                E. coli Positive
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#3a405a] uppercase mb-1">
              Inspection Notes
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Muddy runoff detected in intake reservoir. Bleaching recommended."
              {...register('notes')}
              className="w-full px-3 py-2 text-sm rounded-lg border border-[#685044]/30 bg-white text-[#3a405a]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#685044]/15">
            <Button variant="outline" size="sm" type="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit" loading={isSubmitting}>
              Save Test Result
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
