import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '../utils/validators';
import { NORTHEAST_LOCATION_HIERARCHY } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { UserPlus, AlertCircle, Info, MapPin } from 'lucide-react';

const NE_STATES = Object.keys(NORTHEAST_LOCATION_HIERARCHY);

export const RegisterPage: React.FC = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const defaultState = NE_STATES[0];
  const defaultDistrict = Object.keys(NORTHEAST_LOCATION_HIERARCHY[defaultState])[0];
  const defaultVillage = NORTHEAST_LOCATION_HIERARCHY[defaultState][defaultDistrict][0].name;

  const [selectedState, setSelectedState] = useState<string>(defaultState);
  const [selectedDistrict, setSelectedDistrict] = useState<string>(defaultDistrict);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      village: defaultVillage,
      phone: ''
    }
  });

  const districtsForState = Object.keys(NORTHEAST_LOCATION_HIERARCHY[selectedState] || {});
  const villagesForDistrict =
    NORTHEAST_LOCATION_HIERARCHY[selectedState]?.[selectedDistrict] || [];
  const currentVillage = watch('village');

  const handleStateChange = (newState: string) => {
    setSelectedState(newState);
    const firstDist = Object.keys(NORTHEAST_LOCATION_HIERARCHY[newState] || {})[0] || '';
    setSelectedDistrict(firstDist);
    const firstVil = NORTHEAST_LOCATION_HIERARCHY[newState]?.[firstDist]?.[0]?.name || '';
    setValue('village', firstVil, { shouldValidate: true });
  };

  const handleDistrictChange = (newDist: string) => {
    setSelectedDistrict(newDist);
    const firstVil = NORTHEAST_LOCATION_HIERARCHY[selectedState]?.[newDist]?.[0]?.name || '';
    setValue('village', firstVil, { shouldValidate: true });
  };

  const onSubmit = async (data: RegisterFormData) => {
    setErrorMsg(null);
    try {
      await registerUser(data);
      navigate('/citizen');
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || 'Failed to complete registration. Email may already be in use.'
      );
    }
  };

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg bg-white rounded-3xl p-8 border border-[#685044]/20 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#99b2dd] text-[#3a405a] flex items-center justify-center mx-auto shadow-md">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-[#3a405a]">
            Citizen Surveillance Registration
          </h2>
          <p className="text-xs text-[#685044]">
            Join your Northeast village health sentinel network to report and monitor water safety.
          </p>
        </div>

        {/* Role Notice */}
        <div className="p-3 bg-[#f9dec9]/50 rounded-xl border border-[#685044]/20 flex items-start gap-2 text-xs text-[#3a405a]">
          <Info className="w-4 h-4 text-[#3a405a] flex-shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Public Registration:</strong> Self-registration creates a Citizen account. Health Worker and Administrator credentials are strictly provisioned by Regional Health Authorities.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 bg-rose-50 border border-rose-300 rounded-xl flex items-start gap-2.5 text-xs text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. Rupjyoti Saikia"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. citizen@northeast.in"
            error={errors.email?.message}
            {...register('email')}
          />

          <Input
            label="Password"
            type="password"
            placeholder="At least 6 characters"
            error={errors.password?.message}
            {...register('password')}
          />

          {/* Cascading State -> District -> Village Selector */}
          <div className="p-3.5 bg-[#f9dec9]/30 rounded-xl border border-[#685044]/20 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#3a405a] uppercase">
              <MapPin className="w-3.5 h-3.5" />
              <span>Your Jurisdiction (State → District → Village)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-[#3a405a] uppercase mb-1">
                  State
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => handleStateChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#685044]/30 text-sm text-[#3a405a] bg-white focus:outline-none focus:ring-2 focus:ring-[#99b2dd]"
                >
                  {NE_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#3a405a] uppercase mb-1">
                  District
                </label>
                <select
                  value={selectedDistrict}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-[#685044]/30 text-sm text-[#3a405a] bg-white focus:outline-none focus:ring-2 focus:ring-[#99b2dd]"
                >
                  {districtsForState.map((dist) => (
                    <option key={dist} value={dist}>
                      {dist}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#3a405a] uppercase mb-1">
                Village / Community
              </label>
              <select
                value={currentVillage}
                onChange={(e) => setValue('village', e.target.value, { shouldValidate: true })}
                className="w-full px-3 py-2 rounded-lg border border-[#685044]/30 text-sm text-[#3a405a] bg-white focus:outline-none focus:ring-2 focus:ring-[#99b2dd]"
              >
                {villagesForDistrict.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name}
                  </option>
                ))}
              </select>
              {errors.village && (
                <p className="text-xs text-rose-600 mt-1">{errors.village.message}</p>
              )}
            </div>
          </div>

          <Input
            label="Phone Number (Optional)"
            placeholder="+91 98765 43210"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full font-bold shadow-md"
          >
            Create Citizen Account
          </Button>
        </form>

        <div className="text-center pt-2 text-xs text-[#685044]">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-[#3a405a] hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};
