import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { User, Mail, Phone, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import wholesaleAxios from '../../../SERVICES/Wholesaleaxios';

// ── FIX: import from the correct new slice paths ───────────────────────────
import { selectUser, selectAuthLoading, selectAuthError, clearError, selectIsAuthenticated } from '../../../Components/REDUX_FEATURES/REDUX_SLICES/authApi/authSlice';
import { useGetMeQuery } from '../../../Components/REDUX_FEATURES/REDUX_SLICES/authApi/authApi';

// ─────────────────────────────────────────────────────────────────────────────
// updateProfile thunk — PUT /api/auth/profile  { name, phone }
// ─────────────────────────────────────────────────────────────────────────────
const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ name, phone }, { rejectWithValue }) => {
    try {
      const res = await wholesaleAxios.put('/auth/profile', { name, phone });
      if (!res.data.success)
        throw new Error(res.data.message || 'Failed to update profile');
      return res.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data ?? { message: err.message || 'Failed to update profile' }
      );
    }
  }
);

const logError = (context, error, info = {}) => {
  console.group(`[UserProfile] ERROR in ${context}`);
  console.error('Error:', error);
  console.log('Info:', info);
  console.groupEnd();
};

// ─────────────────────────────────────────────────────────────────────────────
// UserProfile Component
// ─────────────────────────────────────────────────────────────────────────────
const UserProfile = () => {
  const dispatch = useDispatch();

  // ── FIX: use selectors from the new authSlice ─────────────────────────────
  const user       = useSelector(selectUser);
  const authError  = useSelector(selectAuthError);
  const isAuthenticated = useSelector(selectIsAuthenticated);


  // ── FIX: useGetMeQuery replaces the old fetchMe thunk ────────────────────
  // skip=true when user is already in Redux (avoids duplicate network call).
  // refetch() is called manually on "Try Again".
  const {
    isFetching: isMeFetching,
    isError:    isMeError,
    refetch:    refetchMe,
  } = useGetMeQuery(undefined, { skip: !!user || !isAuthenticated });

  // ── Local form state ──────────────────────────────────────────────────────
  const [name,  setName]  = useState('');
  const [phone, setPhone] = useState('');

  // ── Local UI state ────────────────────────────────────────────────────────
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDirty,     setIsDirty]     = useState(false);

  // ── Populate form when user data arrives / changes ────────────────────────
  useEffect(() => {
    if (user) {
      setName(user.name  ?? '');
      setPhone(user.phone ?? '');
      setIsDirty(false);
    }
  }, [user]);

  // ── Field change handlers ─────────────────────────────────────────────────
  const handleNameChange  = (v) => { setName(v);  setIsDirty(true); setSaveSuccess(false); setSaveError(null); };
  const handlePhoneChange = (v) => { setPhone(v); setIsDirty(true); setSaveSuccess(false); setSaveError(null); };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    if (!isDirty || saving) return;

    if (!name.trim())            { setSaveError('Name cannot be empty'); return; }
    if (name.trim().length < 2)  { setSaveError('Name must be at least 2 characters'); return; }

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const result = await dispatch(updateProfile({
        name:  name.trim(),
        phone: phone.trim(),
      })).unwrap();

      if (result.user) {
        setName(result.user.name   ?? name);
        setPhone(result.user.phone ?? phone);
      }

      setIsDirty(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);

    } catch (err) {
      logError('handleSave', err, { name, phone });
      setSaveError(err?.message || 'Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!user) return;
    setName(user.name  ?? '');
    setPhone(user.phone ?? '');
    setIsDirty(false);
    setSaveError(null);
    setSaveSuccess(false);
  };

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (isMeFetching && !user) {
    return (
      <div className="max-w-2xl">
        <div className="h-8 w-56 bg-gray-200 rounded animate-pulse mb-2" />
        <div className="h-4 w-80 bg-gray-100 rounded animate-pulse mb-10" />
        <div className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-3xl bg-gray-200 animate-pulse" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="h-3 w-48 bg-gray-100 rounded animate-pulse" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={i === 2 ? 'col-span-full' : ''}>
                <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Fetch error with no user ──────────────────────────────────────────────
  if ((isMeError || authError) && !user) {
    return (
      <div className="max-w-2xl flex flex-col items-center justify-center py-20 gap-4 text-center">
        <AlertCircle size={36} className="text-red-300" />
        <p className="text-gray-500 font-medium">{authError || 'Failed to load profile'}</p>
        <button
          onClick={() => { dispatch(clearError()); refetchMe(); }}
          className="flex items-center gap-2 bg-[#F7A221] text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-2xl hover:bg-black transition-colors active:scale-95"
        >
          <RefreshCw size={14} /> Try Again
        </button>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Main render
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-2xl">
      <h1 className="text-xl lg:text-3xl md:text-2xl  text-gray-900 mb-2">Personal Settings</h1>
      <p className="text-gray-500 mb-10 text-md md:text-lg">
        Update your information to ensure a smooth checkout experience.
      </p>

      <form onSubmit={handleSave} noValidate>
        <div className="space-y-8">

          {/* Avatar + name display */}
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gray-100 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; }}
                  />
                ) : (
                  <span className="text-2xl font-black text-gray-400 uppercase select-none">
                    {user?.name?.charAt(0) ?? <User size={40} className="text-gray-300" />}
                  </span>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-black text-gray-900">{user?.name ?? '—'}</h4>
              <p className="text-xs text-gray-400 font-bold mt-0.5">{user?.email ?? '—'}</p>
            </div>
          </div>

          {/* Save error */}
          {saveError && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
              <AlertCircle size={16} className="text-red-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm font-semibold text-red-600 flex-1">{saveError}</p>
              <button type="button" onClick={() => setSaveError(null)} className="text-red-300 hover:text-red-500 transition-colors">×</button>
            </div>
          )}

          {/* Save success */}
          {saveSuccess && (
            <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-2xl px-4 py-3">
              <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
              <p className="text-sm font-semibold text-green-700">Profile updated successfully!</p>
            </div>
          )}

          {/* Form fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Full Name */}
            <div className="space-y-2">
              <label htmlFor="profile-name" className="text-[11px] font-black uppercase text-gray-400 ml-1 flex items-center gap-1.5">
                <User size={11} /> Full Name
              </label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Enter your full name"
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-400 focus:bg-white rounded-2xl outline-none font-bold transition-all placeholder:font-normal placeholder:text-gray-300"
              />
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label htmlFor="profile-phone" className="text-[11px] font-black uppercase text-gray-400 ml-1 flex items-center gap-1.5">
                <Phone size={11} /> Phone Number
              </label>
              <input
                id="profile-phone"
                type="tel"
                value={phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
                className="w-full p-4 bg-gray-50 border-2 border-transparent focus:border-orange-400 focus:bg-white rounded-2xl outline-none font-bold transition-all placeholder:font-normal placeholder:text-gray-300"
              />
            </div>

            {/* Email — read only */}
            <div className="col-span-full space-y-2">
              <label className="text-[11px] font-black uppercase text-gray-400 ml-1 flex items-center gap-1.5">
                <Mail size={11} /> Email Address
                <span className="text-[9px] bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full ml-1 normal-case tracking-normal font-bold">
                  Cannot be changed
                </span>
              </label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="w-full p-4 bg-gray-100 border-2 border-transparent rounded-2xl font-bold text-gray-400 cursor-not-allowed select-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4 flex-wrap">
            <button
              type="submit"
              disabled={!isDirty || saving}
              className={`flex items-center gap-2 px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-95 shadow-lg ${
                !isDirty || saving
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-black text-white hover:bg-[#F7A221] shadow-gray-200'
              }`}
            >
              {saving
                ? <><Loader2 size={16} className="animate-spin" /> Saving...</>
                : 'Save Changes'
              }
            </button>

            {isDirty && !saving && (
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-4 rounded-2xl font-black text-sm uppercase tracking-widest text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all"
              >
                Cancel
              </button>
            )}
          </div>

        </div>
      </form>
    </div>
  );
};

export default UserProfile;