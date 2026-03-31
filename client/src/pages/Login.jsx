import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sprout, Smartphone, KeyRound, Loader2, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import LanguageSelector from '../components/LanguageSelector';
import { sendPhoneOtp, verifyPhoneOtp, getProfile, createProfile, signInWithPassword, signUpWithPassword } from '../services/authService';

const Login = () => {
  const location = useLocation();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [role, setRole] = useState(location.state?.defaultRole || 'Farmer');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Store formatted phone between steps
  const [formattedPhone, setFormattedPhone] = useState('');
  const [pendingRole, setPendingRole] = useState('Farmer');
  
  // New State for Password Auth
  const [loginMode, setLoginMode] = useState('otp'); // 'otp' or 'password'
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState(''); // Can be phone or email

  const { login } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const validatePhone = (num) => {
    const digits = num.replace(/\D/g, '');
    return digits.length === 10;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber.trim()) {
      setError('Please enter a phone number');
      return;
    }

    if (!validatePhone(phoneNumber)) {
      setError(t('invalid_phone_err'));
      return;
    }

    setError('');
    setLoading(true);
    try {
      localStorage.setItem('user_role', role);
      const phone = await sendPhoneOtp(phoneNumber);
      setFormattedPhone(phone);
      setPendingRole(role);
      setStep(2);
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('phone_provider_disabled')) {
        setError('Phone Auth is disabled in Supabase. Please enable it in the dashboard.');
      } else {
        setError(msg || 'Error sending OTP. Please check your connectivity.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter both identifier and password');
      return;
    }
    
    // If it looks like a phone number, validate it
    const isEmail = identifier.includes('@');
    if (!isEmail && !validatePhone(identifier)) {
      setError(t('invalid_phone_err'));
      return;
    }

    setError('');
    setLoading(true);
    try {
      localStorage.setItem('user_role', role); // Store for profile retrieval/creation
      // 1. Sign in with Password
      let authData;
      try {
        authData = await signInWithPassword(identifier, password);
      } catch (err) {
        // If user not found, attempt signup (auto-register)
        if (err.message?.includes('Invalid login credentials')) {
          authData = await signUpWithPassword(identifier, password);
        } else {
          throw err;
        }
      }

      const { session, user: authUser } = authData;

      // 2. Profile Management
      let profile = await getProfile(authUser.id);
      if (!profile) {
        profile = await createProfile({
          id: authUser.id,
          phone: isEmail ? '' : identifier,
          role: role,
          name: '',
          location: '',
        });
      }

      // 3. Finalize Login
      login(session, profile);
      navigate(profile.role === 'Farmer' ? '/farmer-dashboard' : '/buyer-dashboard', { replace: true });

    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      setError('Please enter the OTP');
      return;
    }
    setError('');
    setLoading(true);
    try {
      // 1. Verify the OTP — returns { user, session }
      const { user: authUser, session } = await verifyPhoneOtp(formattedPhone, otp);

      // 2. Check if a profile already exists for this user
      let profile = await getProfile(authUser.id);

      // 3. If no profile (new user), create one with the selected role
      if (!profile) {
        profile = await createProfile({
          id: authUser.id,
          phone: formattedPhone,
          role: pendingRole,
          name: '',
          location: '',
        });
      }

      // 4. Set the user in AuthContext directly (avoids race condition with onAuthStateChange)
      login(session, profile);

      // 5. Navigate to the correct dashboard
      navigate(
        profile.role === 'Farmer' ? '/farmer-dashboard' : '/buyer-dashboard',
        { replace: true }
      );
    } catch (err) {
      setError(
        err.message?.includes('expired') || err.message?.includes('invalid')
          ? 'Invalid or expired OTP. Please try again.'
          : err.message || 'Verification failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      <div className="max-w-md w-full glass rounded-2xl shadow-2xl overflow-hidden border border-slate-800">
        <div className="bg-primary-600 p-8 text-center">
          <div className="mx-auto bg-white/20 w-16 h-16 rounded-full flex items-center justify-center border-4 border-primary-500 mb-4 backdrop-blur-sm">
            <Sprout className="text-white w-8 h-8" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            {step === 2 ? t('otp_title') : (loginMode === 'otp' ? t('login_title') : t('password_login'))}
          </h2>
          <div className="flex flex-col items-center gap-2">
            <p className="text-primary-100">
              {step === 2 ? t('otp_subtitle') : (loginMode === 'otp' ? t('login_subtitle') : t('password_subtitle'))}
            </p>
          </div>
        </div>

        <div className="p-8">
          {error && (
            <div className="bg-red-500/10 text-red-400 p-3 rounded-lg text-sm mb-6 w-full text-center border border-red-500/20">
              {error}
            </div>
          )}

          {step === 1 ? (
            <div className="space-y-6">
              {/* Login Mode Toggle */}
              <div className="flex p-1 bg-slate-800/50 rounded-xl border border-slate-700">
                <button
                  onClick={() => setLoginMode('otp')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMode === 'otp' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Phone OTP
                </button>
                <button
                  onClick={() => setLoginMode('password')}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${loginMode === 'password' ? 'bg-primary-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                  Password
                </button>
              </div>

              <form onSubmit={loginMode === 'otp' ? handleSendOtp : handlePasswordLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {loginMode === 'otp' ? t('phone_label') : t('phone_or_email')}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {loginMode === 'otp' ? <Smartphone className="h-5 w-5 text-slate-500" /> : <Mail className="h-5 w-5 text-slate-500" />}
                    </div>
                    <input
                      type={loginMode === 'otp' ? 'tel' : 'text'}
                      className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-800/50 text-white placeholder-slate-500"
                      placeholder={loginMode === 'otp' ? t('phone_placeholder') : t('enter_phone_email')}
                      value={loginMode === 'otp' ? phoneNumber : identifier}
                      onChange={(e) => loginMode === 'otp' ? setPhoneNumber(e.target.value) : setIdentifier(e.target.value)}
                    />
                  </div>
                  {loginMode === 'otp' && (
                    <p className="text-slate-500 text-xs mt-1.5 pl-1">Enter 10-digit mobile number (e.g. 9876543210)</p>
                  )}
                </div>

                {loginMode === 'password' && (
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">{t('password_label')}</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        className="block w-full pl-10 pr-12 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors bg-slate-800/50 text-white placeholder-slate-500"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-white transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                )}

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('select_role')}</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setRole('Farmer')}
                    className={`py-3 px-4 border rounded-xl font-medium transition-all ${
                      role === 'Farmer'
                        ? 'border-primary-500 bg-primary-500/10 text-primary-400 ring-2 ring-primary-500/20'
                        : 'border-slate-700 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {t('role_farmer')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('Buyer')}
                    className={`py-3 px-4 border rounded-xl font-medium transition-all ${
                      role === 'Buyer'
                        ? 'border-primary-500 bg-primary-500/10 text-primary-400 ring-2 ring-primary-500/20'
                        : 'border-slate-700 hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {t('role_buyer')}
                  </button>
                </div>
              </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
                  {loginMode === 'otp' ? t('send_otp') : t('login_with_password')}
                </button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">{t('otp_title')}</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-3 border border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors text-center text-lg tracking-widest bg-slate-800/50 text-white placeholder-slate-500"
                    placeholder={t('otp_placeholder')}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    autoFocus
                  />
                </div>
                <p className="text-slate-500 text-xs mt-1.5 pl-1">OTP sent to {formattedPhone}</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
                {t('verify_otp')}
              </button>

              <button
                type="button"
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
                className="w-full text-center text-sm text-slate-500 hover:text-primary-400 transition-colors"
              >
                ← Back to Login
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-slate-500">
            {t('no_account')} {' '}
            <Link to="/signup" className="font-medium text-emerald-400 hover:text-emerald-300 transition-colors underline underline-offset-4 decoration-emerald-400/30">
              {t('create_account')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
